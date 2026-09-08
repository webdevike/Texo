// Seed Linear-lite data into the Demo workspace over HTTP (login as demo, POST creates).
//   TEXO_PORT=4341 bun scripts/seed-linear.ts [count=10000]
const base = `http://127.0.0.1:${process.env.TEXO_PORT ?? 4321}/api`;
const count = Number(process.argv[2] ?? 10_000);
const login = await fetch(`${base}/_auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "demo@texo.dev", password: "demo1234" }) });
if (!login.ok) throw new Error(`login failed ${login.status}`);
const cookie = (login.headers.get("set-cookie") ?? "").split(";")[0];
const headers = { "content-type": "application/json", cookie };
async function create(entity: string, input: unknown): Promise<{ id: string }> {
  const res = await fetch(`${base}/${entity}/create`, { method: "POST", headers, body: JSON.stringify([input]) });
  if (!res.ok) throw new Error(`${entity} create ${res.status}: ${await res.text()}`);
  return res.json();
}
const teams = await Promise.all([["Platform", "PLT"], ["Growth", "GRO"], ["Mobile", "MOB"]].map(([name, key]) => create("team", { name, key })));
const projects = await Promise.all(["Auth revamp", "Billing v2", "Search", "Onboarding", "iOS parity", "Design system"].map((name, i) => create("project", { name, team: teams[i % 3].id, status: ["planned", "active", "done"][i % 3] })));
const members = await Promise.all(["Ada", "Grace", "Linus", "Margaret", "Ken", "Barbara", "Dennis", "Radia"].map((name) => create("member", { name, email: `${name.toLowerCase()}@texo.dev` })));
const labels = await Promise.all(["bug", "feature", "chore", "docs", "perf", "ux", "infra", "security", "urgent", "good-first"].map((name, i) => create("label", { name, color: ["red", "blue", "gray", "teal", "orange", "grape", "cyan", "pink", "yellow", "green"][i] })));
const STATUS = ["backlog", "todo", "in_progress", "done", "canceled"];
const WORDS = ["login", "sync", "export", "billing", "search", "upload", "cache", "theme", "tokens", "webhook", "mobile", "audit"];
const t0 = performance.now();
const BATCH = 50;
for (let i = 0; i < count; i += BATCH) {
  await Promise.all(Array.from({ length: Math.min(BATCH, count - i) }, (_, j) => {
    const n = i + j;
    return create("issue", {
      title: `Issue ${n}: ${WORDS[n % WORDS.length]} ${WORDS[(n * 7) % WORDS.length]}`,
      description: n % 3 === 0 ? `Reported by user ${n % 97}` : undefined,
      team: teams[n % 3].id,
      project: n % 4 === 0 ? undefined : projects[n % 6].id,
      assignee: n % 5 === 0 ? undefined : members[n % 8].id,
      status: STATUS[n % 5],
      priority: n % 5,
      estimate: n % 7 === 0 ? undefined : (n % 8) + 1,
      due: n % 6 === 0 ? undefined : `2026-${String((n % 12) + 1).padStart(2, "0")}-${String((n % 28) + 1).padStart(2, "0")}`,
      labels: n % 2 === 0 ? [labels[n % 10].id, labels[(n * 3) % 10].id] : [labels[n % 10].id],
      checklist: n % 3 === 0 ? [{ text: "Write tests", done: n % 2 === 0 }, { text: "Ship", done: false }] : undefined,
    });
  }));
}
console.log(`seeded ${count} issues in ${((performance.now() - t0) / 1000).toFixed(1)}s`);
