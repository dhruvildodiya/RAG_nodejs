import DOMMatrix from "dommatrix";
(global as any).DOMMatrix = DOMMatrix;
(global as any).ImageData = class {};
(global as any).Path2D = class {};

// Polyfill for process.getBuiltinModule (missing in Node < 20.16.0)
if (typeof (process as any).getBuiltinModule !== "function") {
  (process as any).getBuiltinModule = (moduleName: string) => {
    if (moduleName.startsWith("node:")) {
      return import(moduleName);
    }
    return undefined;
  };
}
