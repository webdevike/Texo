// Seed a sqlite store with N `issue` rows (spec from app/entities/issue.json) for scale work.
//   bun scripts/seed.ts [path=app/data-10k.sqlite] [count=10000]
// Also exported for adapters/scale.test.ts so the test and the browser proof share one corpus.
import { defineEntity, type Entity, type Input } from "../contracts/entity";
import type { Store } from "../contracts/store";
import { createSqliteStore } from "../adapters/store-sqlite";

export const ISSUE_STATUSES = ["backlog", "todo", "in_progress", "done"] as const;

const WORDS = ["login", "sync", "export", "billing", "search", "upload", "cache", "theme", "tokens", "webhook", "mobile", "audit"];

/** Deterministic row i: same corpus every run so timings and totals are comparable. */
export function issueAt(i: number): Input {
  const status = ISSUE_STATUSES[i % ISSUE_STATUSES.length];
  return {
    title: `Issue ${i}: ${WORDS[i % WORDS.length]} ${WORDS[(i * 7) % WORDS.length]}`,
    status,
    priority: i % 5,
    done: status === "done",
    notes: i % 3 === 0 ? `Reported by user ${i % 97}` : undefined,
  };
}

export async function loadIssueEntity(): Promise<Entity> {
  const spec = await Bun.file(new URL("../app/entities/issue.json", import.meta.url)).json();
  return defineEntity(spec);
}

export async function seedIssues(store: Store, entity: Entity, count: number): Promise<number> {
  await store.migrate(entity);
  const t0 = performance.now();
  for (let i = 0; i < count; i++) await store.create(entity, issueAt(i));
  return performance.now() - t0;
}

if (import.meta.main) {
  const path = process.argv[2] ?? "app/data-10k.sqlite";
  const count = Number(process.argv[3] ?? 10_000);
  const store = createSqliteStore(path);
  const entity = await loadIssueEntity();
  const ms = await seedIssues(store, entity, count);
  const { total } = await store.list(entity, { limit: 1 });
  console.log(`seeded ${count} issues into ${path} in ${ms.toFixed(0)}ms (table now ${total} rows)`);
}
