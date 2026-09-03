// Vite's `?raw` import suffix inlines a file's contents as a string at
// build time — used so migrations/*.sql can be loaded into a test without
// a runtime `fs` read (which isn't available inside the Workers runtime
// tests execute in).
declare module '*.sql?raw' {
  const content: string;
  export default content;
}
