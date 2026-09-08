// Scale proof for the query contract: 10k `issue` rows in sqlite, every list shape the admin
// list surface issues (where + orderBy + limit, search, paging) with timing budgets.
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { Entity, Row } from "../contracts/entity";
import type { ListQuery, Store } from "../contracts/store";
import { issueAt, loadIssueEntity, seedIssues } from "../scripts/seed";
import { createSqliteStore } from "./store-sqlite";

const COUNT = 10_000;
const RUNS = 20;

let store: Store;
let issue: Entity;
const timings: string[] = [];

/** Median wall time over RUNS calls, after one warm-up. Median so a GC pause cannot fail the budget. */
async function timed(label: string, query: ListQuery) {
  await store.list(issue, query);
  const samples: number[] = [];
  let page = await store.list(issue, query);
  for (let i = 0; i < RUNS; i++) {
    const t0 = performance.now();
    page = await store.list(issue, query);
    samples.push(performance.now() - t0);
  }
  samples.sort((a, b) => a - b);
  const median = samples[Math.floor(RUNS / 2)]!;
  const max = samples[RUNS - 1]!;
  timings.push(`${label.padEnd(44)} median ${median.toFixed(2)}ms  max ${max.toFixed(2)}ms  total=${page.total}`);
  return { page, median };
}

beforeAll(async () => {
  store = createSqliteStore(":memory:");
  issue = await loadIssueEntity();
  const ms = await seedIssues(store, issue, COUNT);
  timings.push(`seed ${COUNT} rows`.padEnd(44) + ` ${ms.toFixed(0)}ms (${(ms / COUNT).toFixed(3)}ms/row)`);
});

afterAll(() => {
  console.log(`\nscale (sqlite, ${COUNT} issue rows, median of ${RUNS})\n  ${timings.join("\n  ")}\n`);
});

describe("scale: sqlite with 10k issue rows", () => {
  test("where + orderBy + limit 50 under 50ms with correct total", async () => {
    const expected = Array.from({ length: COUNT }, (_, i) => issueAt(i)).filter((r) => r.status === "todo" && (r.priority as number) >= 2).length;
    const { page, median } = await timed("where{status=todo,priority>=2} order priority desc", {
      where: { status: "todo", priority: { op: "gte", value: 2 } },
      orderBy: [{ field: "priority", direction: "desc" }, { field: "title", direction: "asc" }],
      limit: 50,
    });
    expect(page.total).toBe(expected);
    expect(page.rows).toHaveLength(50);
    for (const r of page.rows) {
      expect(r.status).toBe("todo");
      expect(r.priority as number).toBeGreaterThanOrEqual(2);
    }
    for (let i = 1; i < page.rows.length; i++) expect(page.rows[i - 1]!.priority as number).toBeGreaterThanOrEqual(page.rows[i]!.priority as number);
    expect(median).toBeLessThan(50);
  });

  test("in/nin operator narrows total exactly", async () => {
    const { page } = await timed("where{status in [todo,done]} limit 50", { where: { status: { op: "in", value: ["todo", "done"] } }, limit: 50 });
    expect(page.total).toBe(COUNT / 2);
    const { page: rest } = await timed("where{status nin [todo,done]} limit 50", { where: { status: { op: "nin", value: ["todo", "done"] } }, limit: 50 });
    expect(rest.total).toBe(COUNT / 2);
  });

  test("search under 100ms with correct total", async () => {
    const expected = Array.from({ length: COUNT }, (_, i) => issueAt(i)).filter((r) => String(r.title).toLowerCase().includes("issue 9")).length;
    const { page, median } = await timed('search "issue 9" limit 50', { search: "issue 9", limit: 50 });
    expect(page.total).toBe(expected);
    for (const r of page.rows) expect(String(r.title).toLowerCase()).toContain("issue 9");
    expect(median).toBeLessThan(100);

    const { page: combined, median: m2 } = await timed('search "issue 9" + where{status=done} sorted', {
      search: "issue 9",
      where: { status: "done" },
      orderBy: { field: "title", direction: "asc" },
      limit: 50,
    });
    expect(combined.total).toBe(Array.from({ length: COUNT }, (_, i) => issueAt(i)).filter((r) => String(r.title).toLowerCase().includes("issue 9") && r.status === "done").length);
    expect(m2).toBeLessThan(100);
  });

  test("paging offsets are consistent and disjoint under a stable order", async () => {
    const order: ListQuery["orderBy"] = [{ field: "priority", direction: "desc" }, { field: "id", direction: "asc" }];
    const size = 50;
    const seen = new Set<string>();
    const pages: Row[][] = [];
    let total = 0;
    for (let offset = 0; offset < 500; offset += size) {
      const { page } = offset === 0
        ? await timed("page offset 0 limit 50 (2-key order)", { orderBy: order, offset, limit: size })
        : { page: await store.list(issue, { orderBy: order, offset, limit: size }) };
      total = page.total;
      pages.push(page.rows);
      for (const r of page.rows) {
        expect(seen.has(r.id)).toBe(false);
        seen.add(r.id);
      }
    }
    expect(total).toBe(COUNT);
    expect(seen.size).toBe(500);
    // Re-reading a page returns the same rows in the same positions.
    const again = await store.list(issue, { orderBy: order, offset: 200, limit: size });
    expect(again.rows.map((r) => r.id)).toEqual(pages[4].map((r) => r.id));
    // Deep offset stays cheap enough for infinite scroll.
    const { page: deep, median } = await timed("page offset 9950 limit 50 (2-key order)", { orderBy: order, offset: 9950, limit: size });
    expect(deep.rows).toHaveLength(50);
    expect(median).toBeLessThan(50);
    const past = await store.list(issue, { orderBy: order, offset: COUNT, limit: size });
    expect(past.rows).toHaveLength(0);
    expect(past.total).toBe(COUNT);
  });

  test("unfiltered count and a mid-table page stay under budget", async () => {
    const { page, median } = await timed("no filter, order title asc, offset 5000", { orderBy: { field: "title", direction: "asc" }, offset: 5000, limit: 50 });
    expect(page.total).toBe(COUNT);
    expect(median).toBeLessThan(50);
  });
});
