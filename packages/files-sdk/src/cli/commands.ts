import { FilesError } from "../internal/errors.js";
import {
  emit,
  exitCode,
  parseKeyValuePairs,
  readBody,
  storedFileToJson,
  writeBody,
} from "./io.js";
import type { OutputOpts } from "./io.js";
import { describeProvider, loadFiles } from "./loader.js";
import type { GlobalCliOptions } from "./loader.js";

export interface CommonRunOpts extends OutputOpts {
  dryRun: boolean;
  global: GlobalCliOptions;
}

const dryRun = (action: string, detail: unknown, opts: CommonRunOpts): void => {
  emit(
    {
      action,
      dryRun: true,
      provider: describeProvider(opts.global),
      ...(detail as Record<string, unknown>),
    },
    opts
  );
};

export interface UploadCmdOpts extends CommonRunOpts {
  key: string;
  file?: string;
  stdin?: boolean;
  contentType?: string;
  cacheControl?: string;
  metadata?: readonly string[];
}

export const runUpload = async (opts: UploadCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun(
      "upload",
      {
        cacheControl: opts.cacheControl,
        contentType: opts.contentType,
        key: opts.key,
        metadata: parseKeyValuePairs(opts.metadata),
        source: opts.stdin ? "<stdin>" : opts.file,
      },
      opts
    );
  }
  const { files } = await loadFiles(opts.global);
  const { body } = await readBody({ file: opts.file, stdin: opts.stdin });
  const result = await files.upload(opts.key, body, {
    cacheControl: opts.cacheControl,
    contentType: opts.contentType,
    metadata: parseKeyValuePairs(opts.metadata),
  });
  emit(result, opts);
};

export interface DownloadCmdOpts extends CommonRunOpts {
  key: string;
  out?: string;
  stdout?: boolean;
}

export const runDownload = async (opts: DownloadCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun(
      "download",
      { dest: opts.stdout ? "<stdout>" : opts.out, key: opts.key },
      opts
    );
  }
  const { files } = await loadFiles(opts.global);
  const file = await files.download(opts.key, { as: "stream" });
  await writeBody(file, { out: opts.out, stdout: opts.stdout });
  if (!opts.stdout) {
    // body went to a file; emit status to stdout in the user's chosen format
    emit(storedFileToJson(file), opts);
  } else if (opts.verbose) {
    // body went to stdout; metadata goes to stderr so it doesn't pollute
    // the byte stream. Honor --no-json: humans get key=value lines, JSON
    // mode gets the same envelope it would on stdout.
    const meta = storedFileToJson(file);
    if (opts.json) {
      const text = opts.pretty
        ? JSON.stringify(meta, null, 2)
        : JSON.stringify(meta);
      process.stderr.write(`${text}\n`);
    } else {
      process.stderr.write(`${JSON.stringify(meta, null, 2)}\n`);
    }
  }
};

export interface HeadCmdOpts extends CommonRunOpts {
  keys: string[];
}

export const runHead = async (opts: HeadCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun("head", { keys: opts.keys }, opts);
  }
  const { files } = await loadFiles(opts.global);

  // One key keeps the original throw-on-failure contract and output shape.
  if (opts.keys.length === 1) {
    const file = await files.head(opts.keys[0] as string);
    emit(storedFileToJson(file), opts);
    return;
  }

  // Many keys return a structured result instead of throwing on partial
  // failure. Surface that failure to scripts via a non-zero exit code,
  // mapped from the first error like the single-key path does.
  const result = await files.head(opts.keys);
  emit(
    {
      files: result.files.map(storedFileToJson),
      ...(result.errors && { errors: result.errors }),
    },
    opts
  );
  if (result.errors?.length) {
    process.exit(exitCode(result.errors[0]?.error.code ?? "Provider"));
  }
};

export interface ExistsCmdOpts extends CommonRunOpts {
  keys: string[];
}

export const runExists = async (opts: ExistsCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun("exists", { keys: opts.keys }, opts);
  }
  const { files } = await loadFiles(opts.global);

  // One key keeps the original { exists, key } shape and `test -e` exit code.
  if (opts.keys.length === 1) {
    const key = opts.keys[0] as string;
    const exists = await files.exists(key);
    emit({ exists, key }, opts);
    if (!exists) {
      // exit 1 = missing, matches `test -e` convention
      process.exit(1);
    }
    return;
  }

  // Many keys: a structured existing/missing split. A hard error (auth,
  // transport) exits with its mapped code; otherwise any missing key exits 1,
  // scaling the single-key `test -e` convention to "all keys must exist".
  const result = await files.exists(opts.keys);
  emit(result, opts);
  if (result.errors?.length) {
    process.exit(exitCode(result.errors[0]?.error.code ?? "Provider"));
  }
  if (result.missing.length) {
    process.exit(1);
  }
};

export interface DeleteCmdOpts extends CommonRunOpts {
  keys: string[];
}

export const runDelete = async (opts: DeleteCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun("delete", { keys: opts.keys }, opts);
  }
  const { files } = await loadFiles(opts.global);

  // One key keeps the original throw-on-failure contract and output shape.
  if (opts.keys.length === 1) {
    const key = opts.keys[0] as string;
    await files.delete(key);
    emit({ deleted: true, key }, opts);
    return;
  }

  // Many keys return a structured result instead of throwing on partial
  // failure. Surface that failure to scripts via a non-zero exit code,
  // mapped from the first error like the single-key path does.
  const result = await files.delete(opts.keys);
  emit(result, opts);
  if (result.errors?.length) {
    process.exit(exitCode(result.errors[0]?.error.code ?? "Provider"));
  }
};

export interface CopyCmdOpts extends CommonRunOpts {
  from: string;
  to: string;
}

export const runCopy = async (opts: CopyCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun("copy", { from: opts.from, to: opts.to }, opts);
  }
  const { files } = await loadFiles(opts.global);
  await files.copy(opts.from, opts.to);
  emit({ copied: true, from: opts.from, to: opts.to }, opts);
};

export interface ListCmdOpts extends CommonRunOpts {
  prefix?: string;
  cursor?: string;
  limit?: number;
}

export const runList = async (opts: ListCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun(
      "list",
      { cursor: opts.cursor, limit: opts.limit, prefix: opts.prefix },
      opts
    );
  }
  const { files } = await loadFiles(opts.global);
  const result = await files.list({
    cursor: opts.cursor,
    limit: opts.limit,
    prefix: opts.prefix,
  });
  emit(
    {
      cursor: result.cursor,
      items: result.items.map(storedFileToJson),
    },
    opts
  );
};

export interface UrlCmdOpts extends CommonRunOpts {
  key: string;
  expiresIn?: number;
  responseContentDisposition?: string;
}

export const runUrl = async (opts: UrlCmdOpts): Promise<void> => {
  if (opts.dryRun) {
    return dryRun(
      "url",
      {
        expiresIn: opts.expiresIn,
        key: opts.key,
        responseContentDisposition: opts.responseContentDisposition,
      },
      opts
    );
  }
  const { files } = await loadFiles(opts.global);
  const url = await files.url(opts.key, {
    expiresIn: opts.expiresIn,
    responseContentDisposition: opts.responseContentDisposition,
  });
  emit({ key: opts.key, url }, opts);
};

export interface SignUploadCmdOpts extends CommonRunOpts {
  key: string;
  expiresIn: number;
  contentType?: string;
  maxSize?: number;
  minSize?: number;
}

export const runSignUpload = async (opts: SignUploadCmdOpts): Promise<void> => {
  // commander has already coerced expiresIn to a finite integer via intArg
  // and requiredOption enforces presence — only the sign check is left.
  if (opts.expiresIn <= 0) {
    throw new FilesError(
      "Provider",
      "--expires-in must be a positive number of seconds"
    );
  }
  if (opts.dryRun) {
    return dryRun(
      "sign-upload",
      {
        contentType: opts.contentType,
        expiresIn: opts.expiresIn,
        key: opts.key,
        maxSize: opts.maxSize,
        minSize: opts.minSize,
      },
      opts
    );
  }
  const { files } = await loadFiles(opts.global);
  const signed = await files.signedUploadUrl(opts.key, {
    contentType: opts.contentType,
    expiresIn: opts.expiresIn,
    maxSize: opts.maxSize,
    minSize: opts.minSize,
  });
  emit({ key: opts.key, ...signed }, opts);
};
