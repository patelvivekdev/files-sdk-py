import { describe, expect, test } from "bun:test";

import { deleteManyWithFallback, mapMany } from "../src/internal/core.js";

// These exercise the early-return and stopOnError-success branches of the
// shared bulk engines that no adapter happens to hit (empty input, the
// all-succeed sequential path, and the worker-pool's sparse-array guard).

describe("deleteManyWithFallback", () => {
  test("returns empty result without calling remove for an empty list", async () => {
    let calls = 0;
    const result = await deleteManyWithFallback([], () => {
      calls += 1;
      return Promise.resolve();
    });
    expect(result).toEqual({ deleted: [] });
    expect(calls).toBe(0);
  });

  test("stopOnError returns every key when all removes succeed", async () => {
    const removed: string[] = [];
    const result = await deleteManyWithFallback(
      ["a", "b", "c"],
      (key) => {
        removed.push(key);
        return Promise.resolve();
      },
      { stopOnError: true }
    );
    expect(result).toEqual({ deleted: ["a", "b", "c"] });
    expect(removed).toEqual(["a", "b", "c"]);
  });

  test("worker pool skips undefined slots (sparse key array)", async () => {
    // Leave a hole at index 1 so the worker pool reads `keys[1] === undefined`.
    const keys: string[] = ["a"];
    keys[2] = "c";
    const removed: string[] = [];
    const result = await deleteManyWithFallback(keys, (key) => {
      removed.push(key);
      return Promise.resolve();
    });
    expect(result.deleted).toEqual(["a", "c"]);
    expect(result.errors).toBeUndefined();
    expect(removed).toEqual(["a", "c"]);
  });
});

describe("mapMany", () => {
  test("stopOnError returns all results when every item succeeds", async () => {
    const result = await mapMany(
      ["a", "b"],
      (item) => item,
      (item) => Promise.resolve(item.toUpperCase()),
      { stopOnError: true }
    );
    expect(result).toEqual({ errors: [], results: ["A", "B"] });
  });
});
