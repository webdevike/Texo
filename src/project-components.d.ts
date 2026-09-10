declare module 'virtual:texo-project-components' {
  /** Modules matched by the framed project's texo.json `components` globs (tools/project-components.ts). */
  const modules: Array<{ path: string; module: Record<string, unknown> }>;
  export { modules };
}
