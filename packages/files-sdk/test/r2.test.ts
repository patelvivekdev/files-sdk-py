import { describe, expect, test } from "bun:test";

import { S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";

import { Files, FilesError } from "../src/index.js";
import { r2 } from "../src/r2/index.js";

describe("r2 adapter — HTTP path", () => {
  test("uses S3-compatible endpoint with auto region and path-style", async () => {
    const adapter = r2({
      accessKeyId: "AKID",
      accountId: "ACCT",
      bucket: "uploads",
      secretAccessKey: "SECRET",
    });
    expect(adapter.name).toBe("r2-http");
    const client = adapter.raw as S3Client;
    expect(await client.config.region()).toBe("auto");
    const endpoint = await client.config.endpoint?.();
    expect(endpoint?.hostname).toBe("acct.r2.cloudflarestorage.com");
  });

  test("missing accountId throws at construction", () => {
    const oldId = process.env.R2_ACCOUNT_ID;
    const oldKey = process.env.R2_ACCESS_KEY_ID;
    const oldSecret = process.env.R2_SECRET_ACCESS_KEY;
    delete process.env.R2_ACCOUNT_ID;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    try {
      expect(() => r2({ bucket: "uploads" })).toThrow(/accountId/u);
    } finally {
      if (oldId) {
        process.env.R2_ACCOUNT_ID = oldId;
      }
      if (oldKey) {
        process.env.R2_ACCESS_KEY_ID = oldKey;
      }
      if (oldSecret) {
        process.env.R2_SECRET_ACCESS_KEY = oldSecret;
      }
    }
  });

  test("url() throws Provider with helpful message", async () => {
    const files = new Files({
      adapter: r2({
        accessKeyId: "K",
        accountId: "ACCT",
        bucket: "uploads",
        secretAccessKey: "S",
      }),
    });
    try {
      await files.url("a.txt");
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(FilesError);
      expect((error as FilesError).code).toBe("Provider");
      expect((error as FilesError).message).toMatch(/r2.dev|custom domain/u);
    }
  });

  test("delegates upload to underlying S3 client", async () => {
    const s3Mock = mockClient(S3Client);
    s3Mock.reset();
    const { PutObjectCommand } = await import("@aws-sdk/client-s3");
    s3Mock.on(PutObjectCommand).resolves({ ETag: '"ok"' });
    const files = new Files({
      adapter: r2({
        accessKeyId: "K",
        accountId: "ACCT",
        bucket: "uploads",
        secretAccessKey: "S",
      }),
    });
    const result = await files.upload("a.txt", "hi");
    expect(result.etag).toBe("ok");
    s3Mock.reset();
  });
});

const fakeBinding = () => {
  const map = new Map<
    string,
    {
      bytes: Uint8Array;
      httpMetadata?: { contentType?: string };
      customMetadata?: Record<string, string>;
      etag: string;
      uploaded: Date;
      size: number;
    }
  >();
  let counter = 0;
  const bucket = {
    delete(key: string) {
      map.delete(key);
      return Promise.resolve();
    },
    get(key: string) {
      const entry = map.get(key);
      if (!entry) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        arrayBuffer: () =>
          Promise.resolve(
            entry.bytes.buffer.slice(
              entry.bytes.byteOffset,
              entry.bytes.byteOffset + entry.bytes.byteLength
            )
          ),
        body: new ReadableStream<Uint8Array>({
          start(c) {
            c.enqueue(entry.bytes);
            c.close();
          },
        }),
        customMetadata: entry.customMetadata,
        etag: entry.etag,
        httpMetadata: entry.httpMetadata,
        key,
        size: entry.size,
        text: () => Promise.resolve(new TextDecoder().decode(entry.bytes)),
        uploaded: entry.uploaded,
      });
    },
    head(key: string) {
      const entry = map.get(key);
      if (!entry) {
        return Promise.resolve(null);
      }
      return Promise.resolve({
        customMetadata: entry.customMetadata,
        etag: entry.etag,
        httpMetadata: entry.httpMetadata,
        key,
        size: entry.size,
        uploaded: entry.uploaded,
      });
    },
    list(opts?: { prefix?: string; limit?: number; cursor?: string }) {
      const prefix = opts?.prefix ?? "";
      const objects = [...map.entries()]
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, v]) => ({
          customMetadata: v.customMetadata,
          etag: v.etag,
          httpMetadata: v.httpMetadata,
          key: k,
          size: v.size,
          uploaded: v.uploaded,
        }));
      return Promise.resolve({ cursor: undefined, objects, truncated: false });
    },
    put(
      key: string,
      body: ArrayBuffer | string,
      opts?: {
        httpMetadata?: { contentType?: string };
        customMetadata?: Record<string, string>;
      }
    ) {
      const bytes =
        typeof body === "string"
          ? new TextEncoder().encode(body)
          : new Uint8Array(body);
      counter += 1;
      const entry = {
        bytes,
        customMetadata: opts?.customMetadata,
        etag: `etag-${counter}`,
        httpMetadata: opts?.httpMetadata,
        size: bytes.byteLength,
        uploaded: new Date(),
      };
      map.set(key, entry);
      return Promise.resolve({
        customMetadata: entry.customMetadata,
        etag: entry.etag,
        httpMetadata: entry.httpMetadata,
        key,
        size: entry.size,
        uploaded: entry.uploaded,
      });
    },
  };
  return { bucket, map };
};

describe("r2 adapter — Workers binding path", () => {
  test("upload + download via binding", async () => {
    const { bucket } = fakeBinding();
    const files = new Files({
      adapter: r2({
        binding: bucket as unknown as Parameters<typeof r2>[0] extends {
          binding: infer B;
        }
          ? B
          : never,
      }),
    });
    await files.upload("a.txt", "hello", { contentType: "text/plain" });
    const got = await files.download("a.txt");
    expect(await got.text()).toBe("hello");
    expect(got.type).toBe("text/plain");
  });

  test("delete + head returning NotFound", async () => {
    const { bucket } = fakeBinding();
    const files = new Files({ adapter: r2({ binding: bucket as never }) });
    await files.upload("a.txt", "x");
    await files.delete("a.txt");
    try {
      await files.head("a.txt");
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as FilesError).code).toBe("NotFound");
    }
  });

  test("copy round-trips body since binding has no native copy", async () => {
    const { bucket } = fakeBinding();
    const files = new Files({ adapter: r2({ binding: bucket as never }) });
    await files.upload("from.txt", "payload", { contentType: "text/plain" });
    await files.copy("from.txt", "to.txt");
    const got = await files.download("to.txt");
    expect(await got.text()).toBe("payload");
    expect(got.type).toBe("text/plain");
  });

  test("signedUrl from binding throws Provider", async () => {
    const { bucket } = fakeBinding();
    const files = new Files({ adapter: r2({ binding: bucket as never }) });
    await files.upload("a.txt", "x");
    try {
      await files.signedUrl("a.txt", { expiresIn: 60 });
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as FilesError).code).toBe("Provider");
    }
  });
});
