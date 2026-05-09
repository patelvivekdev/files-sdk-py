import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import type {
  FileMetadata,
  GenerateSignedPostPolicyV4Options,
  Storage as StorageClient,
} from "@google-cloud/storage";
import { Storage } from "@google-cloud/storage";

import type {
  Adapter,
  Body,
  SignedUpload,
  StoredFile,
  UploadResult,
} from "../index.js";
import { readEnv } from "../internal/env.js";
import { FilesError } from "../internal/errors.js";
import type { FilesErrorCode } from "../internal/errors.js";
import { createStoredFile } from "../internal/stored-file.js";

export interface GCSAdapterOptions {
  bucket: string;
  /**
   * GCP project ID. Falls back to `GOOGLE_CLOUD_PROJECT` then
   * `GCLOUD_PROJECT`. Optional — Application Default Credentials carry
   * a project ID and the SDK will discover it automatically.
   */
  projectId?: string;
  /**
   * Path to a service-account JSON file. When set, takes precedence over
   * ADC. Mutually exclusive with `credentials` in practice; if both are
   * passed, the SDK uses `credentials`.
   */
  keyFilename?: string;
  /**
   * Inline service-account credentials. Useful when you only have
   * `client_email` + `private_key` available as separate env vars (e.g.
   * Vercel/Netlify) and don't want to materialize a JSON file. When
   * neither this nor `keyFilename` is set, the SDK falls back to ADC
   * (`GOOGLE_APPLICATION_CREDENTIALS`, `gcloud auth`, GCE metadata).
   */
  credentials?: { client_email: string; private_key: string };
  /**
   * Origin used to build URLs from `url()`. When set, `url(key)` returns
   * `${publicBaseUrl}/${key}` and skips signing — appropriate for a
   * public bucket or a CDN in front of GCS. When unset, `url()` falls
   * back to a V4 signed read URL (default expiry: 1 hour).
   *
   * For a public GCS bucket, the natural value is
   * `https://storage.googleapis.com/<bucket>`.
   */
  publicBaseUrl?: string;
  /**
   * Default expiry, in seconds, for the V4 signed URLs returned by
   * `url()` when `publicBaseUrl` is not set. Defaults to 3600 (1 hour).
   * Per-call `url(key, { expiresIn })` overrides. GCS V4 caps at 7 days.
   */
  defaultUrlExpiresIn?: number;
}

export type GCSAdapter = Adapter<StorageClient> & { readonly bucket: string };

const DEFAULT_URL_EXPIRES_IN = 3600;

const expiresAt = (seconds: number): number => Date.now() + seconds * 1000;

const NOT_FOUND_STATUS = new Set([404]);
const UNAUTH_STATUS = new Set([401, 403]);
const CONFLICT_STATUS = new Set([409, 412]);

const classifyGCSError = (status: number | undefined): FilesErrorCode => {
  if (NOT_FOUND_STATUS.has(status ?? 0)) {
    return "NotFound";
  }
  if (UNAUTH_STATUS.has(status ?? 0)) {
    return "Unauthorized";
  }
  if (CONFLICT_STATUS.has(status ?? 0)) {
    return "Conflict";
  }
  return "Provider";
};

const DEFAULT_MESSAGES: Record<FilesErrorCode, string> = {
  Conflict: "Conflict",
  NotFound: "Not found",
  Provider: "GCS error",
  Unauthorized: "Unauthorized",
};

export const mapGCSError = (err: unknown): FilesError => {
  if (err instanceof FilesError) {
    return err;
  }
  const e = err as {
    code?: number | string;
    message?: string;
    status?: number;
  };
  // GCS ApiError carries the HTTP status on `code` (number). Some auth
  // errors and lower-level wrappers use `status` instead. String `code`
  // values (e.g. "ENOTFOUND") fall through to Provider — we don't try to
  // classify network errors as anything more specific.
  let status: number | undefined;
  if (typeof e?.code === "number") {
    status = e.code;
  } else if (typeof e?.status === "number") {
    ({ status } = e);
  }
  const errorCode = classifyGCSError(status);
  return new FilesError(
    errorCode,
    e?.message ?? DEFAULT_MESSAGES[errorCode],
    err
  );
};

const joinPublicUrl = (base: string, key: string): string => {
  const trimmed = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${trimmed}/${key}`;
};

const normalizeBody = async (
  body: Body,
  contentTypeHint?: string
): Promise<{
  data: Uint8Array | ReadableStream<Uint8Array> | string;
  contentType: string;
  contentLength?: number;
}> => {
  if (typeof body === "string") {
    return {
      contentLength: new TextEncoder().encode(body).byteLength,
      contentType: contentTypeHint ?? "text/plain; charset=utf-8",
      data: body,
    };
  }
  if (body instanceof Uint8Array) {
    return {
      contentLength: body.byteLength,
      contentType: contentTypeHint ?? "application/octet-stream",
      data: body,
    };
  }
  if (body instanceof ArrayBuffer) {
    const data = new Uint8Array(body);
    return {
      contentLength: data.byteLength,
      contentType: contentTypeHint ?? "application/octet-stream",
      data,
    };
  }
  if (ArrayBuffer.isView(body)) {
    const view = body as ArrayBufferView;
    const data = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    return {
      contentLength: data.byteLength,
      contentType: contentTypeHint ?? "application/octet-stream",
      data,
    };
  }
  if (body instanceof Blob) {
    const buf = new Uint8Array(await body.arrayBuffer());
    return {
      contentLength: buf.byteLength,
      contentType: contentTypeHint ?? body.type ?? "application/octet-stream",
      data: buf,
    };
  }
  return {
    contentType: contentTypeHint ?? "application/octet-stream",
    data: body,
  };
};

const uint8ToBuffer = (u8: Uint8Array): Buffer =>
  Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength);

const bufferToUint8 = (buf: Buffer): Uint8Array =>
  new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);

const pipeWebToNode = async (
  web: ReadableStream<Uint8Array>,
  node: NodeJS.WritableStream
): Promise<void> => {
  await pipeline(Readable.fromWeb(web as never), node);
};

const metaToStored = (
  meta: FileMetadata | undefined
): {
  size: number;
  type: string;
  etag?: string;
  lastModified?: number;
  metadata?: Record<string, string>;
} => {
  const userMeta = meta?.metadata as Record<string, string> | undefined;
  const updated = meta?.updated as string | undefined;
  return {
    ...(meta?.etag && { etag: meta.etag }),
    ...(updated && { lastModified: new Date(updated).getTime() }),
    ...(userMeta && { metadata: userMeta }),
    size: Number(meta?.size ?? 0),
    type: meta?.contentType ?? "application/octet-stream",
  };
};

export const gcs = (opts: GCSAdapterOptions): GCSAdapter => {
  const { bucket: bucketName, publicBaseUrl } = opts;
  if (!bucketName) {
    throw new FilesError(
      "Provider",
      "gcs adapter: missing bucket. Pass `bucket`."
    );
  }
  const projectId =
    opts.projectId ??
    readEnv("GOOGLE_CLOUD_PROJECT") ??
    readEnv("GCLOUD_PROJECT");

  const storage = new Storage({
    ...(projectId && { projectId }),
    ...(opts.keyFilename && { keyFilename: opts.keyFilename }),
    ...(opts.credentials && { credentials: opts.credentials }),
  });
  const bucket = storage.bucket(bucketName);
  const defaultUrlExpiresIn =
    opts.defaultUrlExpiresIn ?? DEFAULT_URL_EXPIRES_IN;

  return {
    bucket: bucketName,
    async copy(from, to) {
      try {
        await bucket.file(from).copy(bucket.file(to));
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    async delete(key) {
      try {
        await bucket.file(key).delete();
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    async download(key, downloadOpts) {
      try {
        const file = bucket.file(key);
        if (downloadOpts?.as === "stream") {
          // Stream path needs metadata up front for size/type — the stream
          // itself only carries bytes. One extra round trip vs. the buffer
          // path; same trade-off as S3's HEAD-then-GET on stream downloads.
          const [meta] = await file.getMetadata();
          const m = metaToStored(meta);
          return createStoredFile(
            { key, ...m },
            {
              factory: () =>
                Readable.toWeb(
                  file.createReadStream()
                ) as unknown as ReadableStream<Uint8Array>,
              kind: "stream",
            }
          );
        }
        // Buffer path: parallel fetch of body and metadata so we surface
        // etag/lastModified/contentType without serialized round trips.
        const [downloadResult, metaResult] = await Promise.all([
          file.download(),
          file.getMetadata(),
        ]);
        const [buf] = downloadResult;
        const [meta] = metaResult;
        const m = metaToStored(meta);
        const bytes = bufferToUint8(buf);
        return createStoredFile(
          { key, ...m, size: bytes.byteLength },
          { data: bytes, kind: "buffer" }
        );
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    async head(key) {
      try {
        const file = bucket.file(key);
        const [meta] = await file.getMetadata();
        const m = metaToStored(meta);
        return createStoredFile(
          { key, ...m },
          {
            factory: async () => {
              const [buf] = await file.download();
              return bufferToUint8(buf);
            },
            kind: "lazy",
          }
        );
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    async list(options) {
      try {
        const [files, nextQuery] = await bucket.getFiles({
          autoPaginate: false,
          ...(options?.prefix && { prefix: options.prefix }),
          ...(options?.limit !== undefined && { maxResults: options.limit }),
          ...(options?.cursor && { pageToken: options.cursor }),
        });
        const items: StoredFile[] = files.map((f) => {
          const m = metaToStored(f.metadata);
          return createStoredFile(
            { key: f.name, ...m },
            {
              factory: async () => {
                const [buf] = await f.download();
                return bufferToUint8(buf);
              },
              kind: "lazy",
            }
          );
        });
        const cursor = (nextQuery as { pageToken?: string } | null | undefined)
          ?.pageToken;
        return { items, ...(cursor && { cursor }) };
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    name: "gcs",
    raw: storage,
    async signedUploadUrl(key, signOpts): Promise<SignedUpload> {
      try {
        const file = bucket.file(key);
        if (signOpts.maxSize !== undefined) {
          const minSize = signOpts.minSize ?? 1;
          const conditions: unknown[][] = [
            ["content-length-range", minSize, signOpts.maxSize],
          ];
          if (signOpts.contentType) {
            conditions.push(["eq", "$Content-Type", signOpts.contentType]);
          }
          const policyOpts: GenerateSignedPostPolicyV4Options = {
            conditions,
            expires: expiresAt(signOpts.expiresIn),
            ...(signOpts.contentType && {
              fields: { "content-type": signOpts.contentType },
            }),
          };
          const [policy] = await file.generateSignedPostPolicyV4(policyOpts);
          return { fields: policy.fields, method: "POST", url: policy.url };
        }
        const [url] = await file.getSignedUrl({
          action: "write",
          expires: expiresAt(signOpts.expiresIn),
          version: "v4",
          ...(signOpts.contentType && { contentType: signOpts.contentType }),
        });
        return {
          ...(signOpts.contentType && {
            headers: { "Content-Type": signOpts.contentType },
          }),
          method: "PUT",
          url,
        };
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    async upload(key, body, options) {
      const { data, contentType, contentLength } = await normalizeBody(
        body,
        options?.contentType
      );
      const file = bucket.file(key);
      const writeOpts = {
        contentType,
        metadata: {
          ...(options?.cacheControl && { cacheControl: options.cacheControl }),
          ...(options?.metadata && { metadata: options.metadata }),
        },
        // Single-request uploads — the SDK chunks small bodies and uses
        // resumable for large ones by default, but we don't know the body
        // size for streams here and the simple-upload code path is what we
        // want for the v1 surface. Users with multi-GB needs can drop down
        // to `raw` for a resumable upload.
        resumable: false,
      };
      try {
        if (data instanceof ReadableStream) {
          const writeStream = file.createWriteStream(writeOpts);
          await pipeWebToNode(data, writeStream);
        } else if (typeof data === "string") {
          await file.save(data, writeOpts);
        } else {
          await file.save(uint8ToBuffer(data), writeOpts);
        }
        // GCS doesn't return etag/size from save() — pull authoritative
        // values from a follow-up getMetadata. One extra round trip but
        // simpler than relying on `file.metadata` side effects, which the
        // SDK populates on a best-effort basis.
        const [meta] = await file.getMetadata();
        const updated = meta?.updated as string | undefined;
        return {
          contentType,
          ...(meta?.etag && { etag: meta.etag }),
          key,
          ...(updated && { lastModified: new Date(updated).getTime() }),
          size: contentLength ?? Number(meta?.size ?? 0),
        } satisfies UploadResult;
      } catch (error) {
        throw mapGCSError(error);
      }
    },
    async url(key, urlOpts) {
      // Same precedence rule as S3: `responseContentDisposition` forces
      // signing even when `publicBaseUrl` is set, because a permanent URL
      // can't bind a Content-Disposition override and silently dropping
      // it would be a stored-XSS regression on user-uploaded content.
      const wantsDisposition = Boolean(urlOpts?.responseContentDisposition);
      if (publicBaseUrl && !wantsDisposition) {
        return joinPublicUrl(publicBaseUrl, key);
      }
      try {
        const [signed] = await bucket.file(key).getSignedUrl({
          action: "read",
          expires: expiresAt(urlOpts?.expiresIn ?? defaultUrlExpiresIn),
          version: "v4",
          ...(urlOpts?.responseContentDisposition && {
            responseDisposition: urlOpts.responseContentDisposition,
          }),
        });
        return signed;
      } catch (error) {
        throw mapGCSError(error);
      }
    },
  };
};
