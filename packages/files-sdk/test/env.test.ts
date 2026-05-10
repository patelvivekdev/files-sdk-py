import { afterEach, describe, expect, test } from "bun:test";

import { readEnv } from "../src/internal/env.js";

describe("readEnv", () => {
  const originalProcess = globalThis.process;

  afterEach(() => {
    Object.defineProperty(globalThis, "process", {
      configurable: true,
      value: originalProcess,
      writable: true,
    });
  });

  test("returns the value of a defined env var", () => {
    process.env.__FILES_SDK_TEST_VAR__ = "hello";
    try {
      expect(readEnv("__FILES_SDK_TEST_VAR__")).toBe("hello");
    } finally {
      delete process.env.__FILES_SDK_TEST_VAR__;
    }
  });

  test("returns undefined for an unset env var", () => {
    delete process.env.__FILES_SDK_MISSING_VAR__;
    expect(readEnv("__FILES_SDK_MISSING_VAR__")).toBeUndefined();
  });

  test("returns undefined when `process` is not defined (CF Workers)", () => {
    Object.defineProperty(globalThis, "process", {
      configurable: true,
      value: undefined,
      writable: true,
    });
    expect(typeof process).toBe("undefined");
    expect(readEnv("ANY_KEY")).toBeUndefined();
  });

  test("returns undefined when `process` exists but `process.env` is missing", () => {
    Object.defineProperty(globalThis, "process", {
      configurable: true,
      value: {},
      writable: true,
    });
    expect(readEnv("ANY_KEY")).toBeUndefined();
  });
});
