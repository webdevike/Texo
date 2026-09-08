// Generates the agent-facing API skill for Texo from SOURCE, so it cannot drift.
//   bun scripts/api-index.ts            writes ../../.omp/skills/texo/SKILL.md (repo-relative)
//   bun scripts/api-index.ts --check    exits 1 if the file would change
// Signatures are extracted from the TypeScript source (exports of packages/ui, src/admin hooks,
// the contracts and client adapters); the one-line usage per primitive is curated below and
// fails the build if it names an export that no longer exists (P12).
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "../../..");
const OUT = join(ROOT, ".omp/skills/texo/SKILL.md");

interface Export {
  name: string;
  kind: "function" | "hook" | "component" | "type" | "const";
  signature: string;
  file: string;
}

/** One curated usage line per primitive an app author reaches for. Keys must exist as exports. */
const USAGE: Record<string, string> = {
  TexoDataTable: `<TexoDataTable columns={entity.fields.map((f) => ({ key: f.name, label: f.name }))} rows={list.rows} sort={list.sort} onSortChange={list.setSort} onOpen={(row) => open(row)} onEndReached={list.loadMore} renderCell={(col, value, row) => <Cell field={fieldOf(col.key)} value={value} />} />  // virtualized; j/k + Enter built in`,
  TexoFilterBar: `<TexoFilterBar fields={entity.fields} filters={filters} onFiltersChange={(f) => { setFilters(f); list.setWhere(filtersToWhere(f)); }} search={list.search} onSearchChange={list.setSearch} total={list.total} noun="issue" actions={<BaseButton>New</BaseButton>} />`,
  TexoCommandPalette: `<TexoCommandPalette opened={open} onClose={close} items={commands.map((c) => ({ id: c.id, label: c.label, group: c.group, keys: c.keys }))} onRun={(item) => byId[item.id].run({ navigate, pathname })} />`,
  useHotkeys: `useHotkeys(commands.map((c) => ({ id: c.id, keys: c.keys, run: () => c.run(ctx), when: () => !c.when || c.when({ pathname }) })))  // "mod+k", "c", "g i"; ignores inputs unless inInputs`,
  TexoNavSection: `<TexoNavSection label="Linear"><TexoNavItem active={pathname === "/issues"} icon={<IconList size={16} />} label="Issues" onClick={() => navigate("/issues")} /></TexoNavSection>`,
  TexoNavItem: `<TexoNavItem active label="Board" onClick={...} />  // honors config.sidebar density/active indicator`,
  TexoFieldList: `<TexoFieldList items={items} editing={editing} onEdit={setEditing} onReorder={(parent, ids) => ...} renderEditor={(item) => <Editor />} />`,
  TexoAppShell: `app.tsx owns the shell; extensions add rail content via nav contributions, not by rendering TexoAppShell`,
  useTexoTheme: `const { config, updateConfig, applyPreset } = useTexoTheme(); config.sidebar.density; config.table.striped; config.chartColors[0]`,
  TexoThemeProvider: `main.tsx owns it; read via useTexoTheme()`,
  useList: `const list = useList(store, entity, { orderBy: { field: "priority", direction: "desc" }, limit: 100 }); list.rows, list.total, list.setSearch, list.setWhere, list.setSort, list.loadMore, list.refetch`,
  useLive: `const { rows, total } = useLive(liveStore, entity, { where: { status: "todo" } });  // re-evaluates locally on every ChangeEvent`,
  useOptimistic: `const { create, update, remove, pending } = useOptimistic(liveStore, entity); await update(id, { status: "done" })  // rolls back on 422`,
  createLiveStore: `const store = createLiveStore(createHttpStore("/api", { origin: "tab-" + crypto.randomUUID() }));  // one per app; subscribe(null) once; watch(entity, query, cb)`,
  createHttpStore: `createHttpStore("/api", { origin })  // ClientStore over the host; SSE at /api/_events`,
  useSession: `const { session, refresh } = useSession(); session.user.id; session.workspace.id`,
  useManifest: `const manifest = useManifest(); entitiesOf(manifest).find((e) => e.name === "issue")`,
  entitiesOf: `entitiesOf(manifest) -> Entity[] (zod derived); pass an Entity to every store call`,
  host: `host.manifest(); host.getSetting(key); host.putSetting(key, value); host.putSpec(spec)`,
  defineExtension: `export default defineExtension({ id: "linear", name: "Linear", routes: [{ path: "/issues", element: IssuesPage }], nav: [{ section: "Linear", label: "Issues", path: "/issues", icon: <IconList size={16} /> }], commands: [{ id: "linear.new", label: "New issue", keys: "c", group: "Linear", run: ({ navigate }) => navigate("/issues?new=1") }] })`,
  EntityForm: `<EntityForm entity={entity} row={row} store={store} resolveEntity={(n) => entities.find((e) => e.name === n)} onSubmit={async (v) => { await store.update(entity, row.id, v); }} onCancel={close} />`,
  FieldControl: `<FieldControl field={field} value={row[field.name]} onChange={(v) => update(row.id, { [field.name]: v })} store={store} resolveEntity={resolveEntity} />  // one inline editor per field kind`,
  RelationField: `<RelationField label="Assignee" target={memberEntity} store={store} value={row.assignee} onChange={(id) => update(row.id, { assignee: id })} />  // searchable select over the target entity; RelationManyField for many`,
};

const SOURCES = [
  "packages/ui/src",
  "src/admin/hooks",
  "src/admin/fields",
  "src/admin",
  "src/extensions/backend",
  "experiments/contracts-spike/contracts",
  "experiments/contracts-spike/adapters/store-live.ts",
  "experiments/contracts-spike/adapters/store-http.ts",
];

const SKIP = /\.(test|spec|conformance)\.tsx?$|\.module\.css$|\/components\.ts$|\/mantine\.ts$|\/hooks\.ts$/;

function files(): string[] {
  const out: string[] = [];
  for (const s of SOURCES) {
    const p = join(ROOT, s);
    if (!existsSync(p)) continue;
    if (p.endsWith(".ts") || p.endsWith(".tsx")) {
      out.push(p);
      continue;
    }
    for (const f of readdirSync(p)) {
      const full = join(p, f);
      if (/\.tsx?$/.test(f) && !SKIP.test(full)) out.push(full);
    }
  }
  return [...new Set(out)];
}

function extract(file: string): Export[] {
  const src = readFileSync(file, "utf8");
  const rel = file.slice(ROOT.length + 1);
  const out: Export[] = [];
  const re = /^export\s+(?:default\s+)?(async\s+)?(function|const|interface|type|class)\s+([A-Za-z_$][\w$]*)([^\n]*)/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [, , decl, name, rest] = m;
    if (!name || name.startsWith("_")) continue;
    let signature = `${name}${rest ?? ""}`.trim();
    if (decl === "function" || decl === "const") {
      // Capture through the parameter list (balanced parens) plus return annotation up to `{` or `=>`.
      const start = m.index + m[0].indexOf(name);
      let i = start;
      let depth = 0;
      let seenParen = false;
      for (; i < src.length && i - start < 600; i++) {
        const c = src[i];
        if (c === "(") {
          depth++;
          seenParen = true;
        } else if (c === ")") depth--;
        if (seenParen && depth === 0 && (src[i] === "{" || src.startsWith("=>", i) || src[i] === ";" || src[i] === "\n")) break;
      }
      signature = src.slice(start, i).replace(/\s+/g, " ").replace(/\s*=\s*$/, "").trim();
    }
    const kind: Export["kind"] =
      decl === "interface" || decl === "type" ? "type" : /^use[A-Z]/.test(name) ? "hook" : /^[A-Z]/.test(name) && (decl === "function" || /\.tsx$/.test(file)) ? "component" : decl === "const" ? "const" : "function";
    out.push({ name, kind, signature, file: rel });
  }
  return out;
}

function render(exports: Export[]): string {
  const byKind = (k: Export["kind"]) => exports.filter((e) => e.kind === k).sort((a, b) => a.name.localeCompare(b.name));
  const names = new Set(exports.map((e) => e.name));
  const missing = Object.keys(USAGE).filter((n) => !names.has(n));
  if (missing.length) throw new Error(`USAGE names exports that do not exist: ${missing.join(", ")}`);

  const line = (e: Export) => {
    const usage = USAGE[e.name];
    return `- \`${e.signature}\`  <sub>${e.file}</sub>${usage ? `\n  - use: \`${usage.replace(/`/g, "'")}\`` : ""}`;
  };

  return `---
name: texo
description: Building an app or extension on Texo. Read this before opening any source file: every primitive, hook, contract and adapter is listed with its signature and one usage line. Open a source file only when a signature here is not enough.
---

# Texo API index (generated by experiments/contracts-spike/scripts/api-index.ts, do not edit)

Layout: \`packages/ui\` = @texo/ui (Mantine Base* aliases + primitives). \`src/admin\` = hooks, field editors, host client, auth. \`src/extensions/<name>/index.ts\` = extensions (default export \`defineExtension\`). \`experiments/contracts-spike/contracts\` = Entity/Store/Extension/Auth contracts. Entities are JSON specs in \`experiments/contracts-spike/app/entities/*.json\`, migrated by the host at boot; the client reads them from \`host.manifest()\`.

Rules: Mantine only via \`Base*\` aliases from \`@texo/ui\` (add a missing alias in \`packages/ui/src/components.ts\`). Icons from \`@tabler/icons-react\`. Every store call takes an \`Entity\` (from \`entitiesOf(manifest)\`), never a name. Field kinds: string | number | boolean | enum | date | relation{to,many?} | group{fields,repeatable?}. \`list()\` returns \`{ rows, total }\`; \`where\` values are bare (eq) or \`{ op, value }\` with op in eq ne in nin lt lte gt gte contains isNull. There is no board primitive yet: build one with @dnd-kit/core (DndContext, useDroppable per column, useDraggable per card) over an enum field and call useOptimistic().update on drop. Realtime: one \`createLiveStore\` per app, \`useLive\` for lists, \`useOptimistic\` for writes. Keys: \`CommandContribution.keys\` ("c", "mod+k", "g i"), bound by \`useHotkeys\`; \`?\` help and \`mod+k\` palette already exist in \`src/app/commands.tsx\`.

## Components (@texo/ui and src/admin)
${byKind("component").map(line).join("\n")}

## Hooks
${byKind("hook").map(line).join("\n")}

## Functions
${byKind("function").map(line).join("\n")}

## Types (contracts)
${byKind("type").map((e) => `- \`${e.signature}\`  <sub>${e.file}</sub>`).join("\n")}

## Consts
${byKind("const").map(line).join("\n")}
`;
}

const doc = render(files().flatMap(extract));
if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : "";
  if (current !== doc) {
    console.error("api index is stale: run bun scripts/api-index.ts");
    process.exit(1);
  }
  console.log("api index up to date");
} else {
  mkdirSync(join(OUT, ".."), { recursive: true });
  writeFileSync(OUT, doc);
  console.log(`wrote ${OUT.slice(ROOT.length + 1)} (${doc.split("\n").length} lines)`);
}
