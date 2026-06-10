import { describe, expect, test } from "bun:test";

import { FilesError } from "../src/internal/errors.js";
import { createOffsetHttpDriver } from "../src/internal/resumable-offset-http.js";

// The offset-HTTP driver's per-provider behavior is exercised through the GCS,
// Firebase, and Google Drive adapter suites. This covers the one path those
// can't reach via the orchestrator: discarding before a session was opened.
describe("offset-http driver", () => {
  test("discard before a session is opened is a no-op", async () => {
    const driver = createOffsetHttpDriver({
      open: () => Promise.reject(new Error("unused")),
      parseResult: () => Promise.reject(new Error("unused")),
      partSize: 4,
      resume: () => "uri",
      wrapErr: (error) => FilesError.wrap(error),
    });
    await expect(driver.discard()).resolves.toBeUndefined();
  });

  test("a mid-chunk 308 without a Range header throws instead of skipping the chunk", async () => {
    // The protocol's 308-without-Range means "nothing persisted" (probe maps
    // it to offset 0); advancing past the chunk would silently drop its bytes.
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(
        new Response(null, { status: 308 })
      )) as unknown as typeof fetch;
    try {
      const driver = createOffsetHttpDriver({
        open: () => Promise.reject(new Error("unused")),
        parseResult: () => Promise.reject(new Error("unused")),
        partSize: 4,
        resume: () => "https://upload.example.com/session/x",
        wrapErr: (error) => FilesError.wrap(error),
      });
      driver.adopt({
        bucket: "b",
        key: "k",
        provider: "gcs",
        uri: "https://upload.example.com/session/x",
      });
      await expect(
        driver.uploadAt({
          data: new Uint8Array(4),
          isLast: false,
          offset: 0,
          total: 8,
        })
      ).rejects.toThrow(/no bytes persisted/u);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("probing an already-finalized session reports a past-the-end offset", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (() =>
      Promise.resolve(Response.json({ size: "8" }))) as unknown as typeof fetch;
    try {
      const driver = createOffsetHttpDriver({
        open: () => Promise.reject(new Error("unused")),
        parseResult: () =>
          Promise.resolve({
            contentType: "application/octet-stream",
            key: "k",
            size: 8,
          }),
        partSize: 4,
        resume: () => "https://upload.example.com/session/x",
        wrapErr: (error) => FilesError.wrap(error),
      });
      driver.adopt({
        bucket: "b",
        key: "k",
        provider: "gcs",
        uri: "https://upload.example.com/session/x",
      });
      const { nextOffset } = await driver.probe();
      expect(nextOffset).toBeGreaterThan(8);
      // complete() then serves the probed final result.
      await expect(driver.complete([])).resolves.toMatchObject({ size: 8 });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
