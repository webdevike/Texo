declare module 'virtual:texo-canvas-runtime' {
  const instances: import('./app/canvas-document').CanvasInstance[];
  export { instances };
  export default instances;
}
