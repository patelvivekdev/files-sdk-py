import { describe, expect, test } from "bun:test";

import { compareKeys, paginateKeys } from "../src/internal/walk-paginate.js";

describe("compareKeys", () => {
  test("orders keys lexicographically with a stable tri-state result", () => {
    expect(compareKeys("a", "b")).toBe(-1);
    expect(compareKeys("b", "a")).toBe(1);
    expect(compareKeys("a", "a")).toBe(0);
  });

  test("sorts a key list into ascending order", () => {
    const sorted = ["c", "a", "b"].toSorted(compareKeys);
    expect(sorted).toEqual(["a", "b", "c"]);
  });
});

describe("paginateKeys", () => {
  test("pages with a cursor and reports more remaining", () => {
    const keys = ["a", "b", "c", "d"];
    const first = paginateKeys(keys, { limit: 2 });
    expect(first).toEqual({ cursor: "b", keys: ["a", "b"] });
    const second = paginateKeys(keys, { cursor: first.cursor, limit: 2 });
    expect(second).toEqual({ keys: ["c", "d"] });
  });
});
