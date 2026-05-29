import { describe, expect, test } from "bun:test";

import {
  compareKeys,
  paginateHierarchy,
  paginateKeys,
} from "../src/internal/walk-paginate.js";

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

describe("paginateHierarchy", () => {
  const tree = [
    "photos/2023/a.jpg",
    "photos/2023/b.jpg",
    "photos/2024/c.jpg",
    "photos/cover.jpg",
    "photos/index.html",
  ];

  test("splits direct files from collapsed folders", () => {
    const page = paginateHierarchy(tree, { delimiter: "/", prefix: "photos/" });
    expect(page.items).toEqual(["photos/cover.jpg", "photos/index.html"]);
    expect(page.prefixes).toEqual(["photos/2023/", "photos/2024/"]);
    expect(page.cursor).toBeUndefined();
  });

  test("a collapsed folder counts as one entry and never splits a page", () => {
    // limit 1: the whole 2023/ group collapses into one prefix; the cursor is
    // the LAST real key of that group, so the next page resumes past it.
    const p1 = paginateHierarchy(tree, {
      delimiter: "/",
      limit: 1,
      prefix: "photos/",
    });
    expect(p1.items).toEqual([]);
    expect(p1.prefixes).toEqual(["photos/2023/"]);
    expect(p1.cursor).toBe("photos/2023/b.jpg");

    const p2 = paginateHierarchy(tree, {
      cursor: p1.cursor,
      delimiter: "/",
      limit: 1,
      prefix: "photos/",
    });
    expect(p2.prefixes).toEqual(["photos/2024/"]);
    expect(p2.cursor).toBe("photos/2024/c.jpg");

    const p3 = paginateHierarchy(tree, {
      cursor: p2.cursor,
      delimiter: "/",
      limit: 1,
      prefix: "photos/",
    });
    expect(p3.items).toEqual(["photos/cover.jpg"]);
    expect(p3.cursor).toBe("photos/cover.jpg");

    const p4 = paginateHierarchy(tree, {
      cursor: p3.cursor,
      delimiter: "/",
      limit: 1,
      prefix: "photos/",
    });
    expect(p4.items).toEqual(["photos/index.html"]);
    expect(p4.cursor).toBeUndefined();
  });

  test("walking all pages never re-lists a collapsed group", () => {
    const seenItems: string[] = [];
    const seenPrefixes: string[] = [];
    let cursor: string | undefined;
    do {
      const page = paginateHierarchy(tree, {
        delimiter: "/",
        limit: 1,
        prefix: "photos/",
        ...(cursor !== undefined && { cursor }),
      });
      seenItems.push(...page.items);
      seenPrefixes.push(...page.prefixes);
      ({ cursor } = page);
    } while (cursor);
    expect(seenItems).toEqual(["photos/cover.jpg", "photos/index.html"]);
    expect(seenPrefixes).toEqual(["photos/2023/", "photos/2024/"]);
  });

  test("mixes items and prefixes within a single page", () => {
    const page = paginateHierarchy(tree, {
      delimiter: "/",
      limit: 3,
      prefix: "photos/",
    });
    expect(page.prefixes).toEqual(["photos/2023/", "photos/2024/"]);
    expect(page.items).toEqual(["photos/cover.jpg"]);
    expect(page.cursor).toBe("photos/cover.jpg");
  });

  test("works with no prefix", () => {
    const page = paginateHierarchy(["a.txt", "x/1", "x/2", "y/1"], {
      delimiter: "/",
    });
    expect(page.items).toEqual(["a.txt"]);
    expect(page.prefixes).toEqual(["x/", "y/"]);
  });

  test("supports a multi-character delimiter", () => {
    const page = paginateHierarchy(["a::1", "a::2", "b"], { delimiter: "::" });
    expect(page.items).toEqual(["b"]);
    expect(page.prefixes).toEqual(["a::"]);
  });

  test("supports a non-slash delimiter", () => {
    const page = paginateHierarchy(["a-1", "a-2", "z"], { delimiter: "-" });
    expect(page.items).toEqual(["z"]);
    expect(page.prefixes).toEqual(["a-"]);
  });

  test("folds a directory-marker key into its folder rather than listing it", () => {
    // "photos/sub/" is a zero-byte folder marker; under prefix "photos/" with
    // delimiter "/" it collapses into the "photos/sub/" prefix alongside the
    // file beneath it — not emitted as a standalone item.
    const page = paginateHierarchy(["photos/sub/", "photos/sub/a.jpg"], {
      delimiter: "/",
      prefix: "photos/",
    });
    expect(page.items).toEqual([]);
    expect(page.prefixes).toEqual(["photos/sub/"]);
  });

  test("a key equal to the prefix is a direct item, not a folder", () => {
    const page = paginateHierarchy(["photos/", "photos/a.jpg"], {
      delimiter: "/",
      prefix: "photos/",
    });
    expect(page.items).toEqual(["photos/", "photos/a.jpg"]);
    expect(page.prefixes).toEqual([]);
  });

  test("groups when the prefix does not end in the delimiter", () => {
    const page = paginateHierarchy(["photofile.txt", "photos/a", "photos/b"], {
      delimiter: "/",
      prefix: "photo",
    });
    expect(page.items).toEqual(["photofile.txt"]);
    expect(page.prefixes).toEqual(["photos/"]);
  });

  test("a cursor past every key yields an empty page", () => {
    const page = paginateHierarchy(["a/1", "b/1"], {
      cursor: "z",
      delimiter: "/",
    });
    expect(page.items).toEqual([]);
    expect(page.prefixes).toEqual([]);
    expect(page.cursor).toBeUndefined();
  });
});
