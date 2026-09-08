// The extension contract: `defineExtension` validates ids; `buildRegistry` rejects duplicate
// extension and command ids, sorts nav by order, flattens routes/views. The loader's merge
// step (`src/extensions/merge.ts`, what `load.ts` runs over `import.meta.glob`) is exercised
// with two fake extension modules, no Vite.
import { describe, expect, test } from "bun:test";
import { collectExtensions, componentsOf } from "../../../src/extensions/merge";
import { buildRegistry, defineExtension } from "./extension";

const Page = () => null;

describe("defineExtension", () => {
  test("accepts kebab-case ids and returns the definition", () => {
    const def = defineExtension({ id: "issues", name: "Issues" });
    expect(def.id).toBe("issues");
  });
  test("rejects non kebab-case ids", () => {
    expect(() => defineExtension({ id: "Issues", name: "x" })).toThrow(/kebab-case/);
    expect(() => defineExtension({ id: "my_ext", name: "x" })).toThrow(/kebab-case/);
    expect(() => defineExtension({ id: "1st", name: "x" })).toThrow(/kebab-case/);
  });
});

describe("buildRegistry", () => {
  test("rejects duplicate extension ids", () => {
    const a = defineExtension({ id: "a", name: "A" });
    expect(() => buildRegistry([a, { ...a }])).toThrow(/duplicate extension id "a"/);
  });

  test("rejects duplicate command ids across extensions", () => {
    const run = () => undefined;
    const a = defineExtension({ id: "a", name: "A", commands: [{ id: "go", label: "Go", run }] });
    const b = defineExtension({ id: "b", name: "B", commands: [{ id: "go", label: "Go again", run }] });
    expect(() => buildRegistry([a, b])).toThrow(/duplicate command id "go"/);
  });

  test("sorts nav by order, stable across extensions, missing order = 0", () => {
    const a = defineExtension({
      id: "a",
      name: "A",
      nav: [
        { section: "S", label: "third", path: "/3", order: 30 },
        { section: "S", label: "first", path: "/1", order: 10 },
      ],
    });
    const b = defineExtension({
      id: "b",
      name: "B",
      nav: [
        { section: "S", label: "zero", path: "/0" },
        { section: "S", label: "second", path: "/2", order: 20 },
      ],
    });
    const reg = buildRegistry([a, b]);
    expect(reg.nav.map((n) => n.label)).toEqual(["zero", "first", "second", "third"]);
  });

  test("flattens routes and views in extension order", () => {
    const a = defineExtension({
      id: "a",
      name: "A",
      routes: [{ path: "/a", element: Page }, { path: "/a/:id", element: Page }],
      views: [{ id: "a.list", entity: "issue", label: "List", component: Page }],
    });
    const b = defineExtension({ id: "b", name: "B", routes: [{ path: "/b", element: Page }] });
    const reg = buildRegistry([a, b]);
    expect(reg.routes.map((r) => r.path)).toEqual(["/a", "/a/:id", "/b"]);
    expect(reg.views.map((v) => v.id)).toEqual(["a.list"]);
    expect(reg.extensions).toEqual([a, b]);
  });

  test("empty input yields empty registries", () => {
    const reg = buildRegistry([]);
    expect(reg).toEqual({ extensions: [], routes: [], nav: [], commands: [], views: [] });
  });
});

describe("loader-style merge of two extensions", () => {
  const issues = defineExtension({
    id: "issues",
    name: "Issues",
    routes: [{ path: "/issues", element: Page }],
    nav: [{ section: "Pages", label: "Issues", path: "/issues", order: 2 }],
    commands: [{ id: "issues.new", label: "New issue", keys: "c", run: () => undefined }],
    components: { "issue-card": { id: "issue-card" } },
  });
  const projects = defineExtension({
    id: "projects",
    name: "Projects",
    routes: [{ path: "/projects", element: Page }],
    nav: [{ section: "Pages", label: "Projects", path: "/projects", order: 1 }],
    commands: [{ id: "projects.go", label: "Go to projects", keys: "g p", run: () => undefined }],
    components: { "project-card": { id: "project-card" } },
  });
  // Glob order is not sorted; the loader sorts by path so the result is deterministic.
  const modules = { "./projects/index.ts": { default: projects }, "./issues/index.ts": { default: issues } };

  test("merges routes, nav (ordered), commands and components", () => {
    const defs = collectExtensions(modules);
    const reg = buildRegistry(defs);
    expect(reg.extensions.map((e) => e.id)).toEqual(["issues", "projects"]);
    expect(reg.routes.map((r) => r.path)).toEqual(["/issues", "/projects"]);
    expect(reg.nav.map((n) => n.label)).toEqual(["Projects", "Issues"]);
    expect(reg.commands.map((c) => c.id)).toEqual(["issues.new", "projects.go"]);
    expect(Object.keys(componentsOf(reg))).toEqual(["issue-card", "project-card"]);
  });

  test("a module without a default extension is rejected", () => {
    expect(() => collectExtensions({ "./broken/index.ts": {} })).toThrow(/broken\/index.ts must default-export/);
  });

  test("component ids collide across extensions", () => {
    const dup = defineExtension({ id: "dup", name: "Dup", components: { "issue-card": { id: "issue-card" } } });
    expect(() => componentsOf(buildRegistry([issues, dup]))).toThrow(/duplicate component id "issue-card"/);
  });
});
