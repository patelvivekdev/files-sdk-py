import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

import { Files, FilesError } from "../src/index.js";

// Mock @vercel/blob before the adapter imports it.
const putMock = mock((pathname: string, _body: unknown, _opts?: unknown) =>
  Promise.resolve({
    contentDisposition: "",
    contentType: "text/plain",
    downloadUrl: `https://blob.test/${pathname}?download=1`,
    pathname,
    url: `https://blob.test/${pathname}`,
  })
);
const headMock = mock((pathname: string) =>
  Promise.resolve({
    cacheControl: "",
    contentDisposition: "",
    contentType: "text/plain",
    downloadUrl: `https://blob.test/${pathname}?download=1`,
    pathname,
    size: 5,
    uploadedAt: new Date(),
    url: `https://blob.test/${pathname}`,
  })
);
const delMock = mock((_pathname: string | string[]) => Promise.resolve());
const copyMock = mock((_from: string, to: string) =>
  Promise.resolve({
    contentDisposition: "",
    contentType: "text/plain",
    downloadUrl: `https://blob.test/${to}?download=1`,
    pathname: to,
    url: `https://blob.test/${to}`,
  })
);
const listMock = mock((_opts?: unknown) =>
  Promise.resolve({
    blobs: [
      {
        downloadUrl: "https://blob.test/a/1.txt?download=1",
        pathname: "a/1.txt",
        size: 1,
        uploadedAt: new Date(),
        url: "https://blob.test/a/1.txt",
      },
    ],
    cursor: undefined,
    hasMore: false,
  })
);

mock.module("@vercel/blob", () => ({
  copy: copyMock,
  del: delMock,
  head: headMock,
  list: listMock,
  put: putMock,
}));

const { vercelBlob } = await import("../src/vercel-blob/index.js");

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = "test-token";
  putMock.mockClear();
  headMock.mockClear();
  delMock.mockClear();
  copyMock.mockClear();
  listMock.mockClear();
});

afterEach(() => {
  delete process.env.BLOB_READ_WRITE_TOKEN;
});

describe("vercel-blob adapter", () => {
  test("missing token throws at construction", () => {
    delete process.env.BLOB_READ_WRITE_TOKEN;
    expect(() => vercelBlob()).toThrow(/token/iu);
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
  });

  test("upload calls blob.put with the right options", async () => {
    const files = new Files({ adapter: vercelBlob() });
    const result = await files.upload("a.txt", "hello", {
      cacheControl: "public, max-age=60",
      contentType: "text/plain",
    });
    expect(result.key).toBe("a.txt");
    expect(putMock).toHaveBeenCalledTimes(1);
    const [firstPutCall] = putMock.mock.calls;
    if (!firstPutCall) {
      throw new Error("expected put to have been called");
    }
    const [path, , opts] = firstPutCall;
    expect(path).toBe("a.txt");
    const o = opts as {
      access: string;
      addRandomSuffix: boolean;
      cacheControlMaxAge?: number;
      contentType?: string;
    };
    expect(o.access).toBe("public");
    expect(o.addRandomSuffix).toBe(false);
    expect(o.cacheControlMaxAge).toBe(60);
    expect(o.contentType).toBe("text/plain");
  });

  test("head returns metadata with url stashed in metadata", async () => {
    const files = new Files({ adapter: vercelBlob() });
    const info = await files.head("a.txt");
    expect(info.key).toBe("a.txt");
    expect(info.size).toBe(5);
    expect(info.metadata?.url).toBe("https://blob.test/a.txt");
  });

  test("delete delegates to blob.del", async () => {
    const files = new Files({ adapter: vercelBlob() });
    await files.delete("a.txt");
    expect(delMock).toHaveBeenCalledTimes(1);
    const [firstDelCall] = delMock.mock.calls;
    if (!firstDelCall) {
      throw new Error("expected del to have been called");
    }
    const [delArg] = firstDelCall;
    expect(delArg).toBe("a.txt");
  });

  test("copy delegates to blob.copy", async () => {
    const files = new Files({ adapter: vercelBlob() });
    await files.copy("a.txt", "b.txt");
    expect(copyMock).toHaveBeenCalledTimes(1);
    const [firstCopyCall] = copyMock.mock.calls;
    if (!firstCopyCall) {
      throw new Error("expected copy to have been called");
    }
    const [fromArg, toArg] = firstCopyCall;
    expect(fromArg).toBe("a.txt");
    expect(toArg).toBe("b.txt");
  });

  test("list maps blobs into StoredFile items", async () => {
    const files = new Files({ adapter: vercelBlob() });
    const out = await files.list({ prefix: "a/" });
    expect(out.items.map((i) => i.key)).toEqual(["a/1.txt"]);
  });

  test("url returns the blob's public URL", async () => {
    const files = new Files({ adapter: vercelBlob() });
    const url = await files.url("a.txt");
    expect(url).toBe("https://blob.test/a.txt");
  });

  test("signedUrl returns the same public URL (Vercel Blob URLs don't expire)", async () => {
    const files = new Files({ adapter: vercelBlob() });
    const url = await files.signedUrl("a.txt", { expiresIn: 60 });
    expect(url).toBe("https://blob.test/a.txt");
  });

  test("signedUploadUrl throws Provider", async () => {
    const files = new Files({ adapter: vercelBlob() });
    try {
      await files.signedUploadUrl("a.txt", { expiresIn: 60 });
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(FilesError);
      expect((error as FilesError).code).toBe("Provider");
      expect((error as FilesError).message).toMatch(/handleUpload/u);
    }
  });
});
