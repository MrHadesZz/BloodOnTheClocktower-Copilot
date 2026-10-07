/* Classic Worker: Z3's pthread loader depends on importScripts and SharedArrayBuffer. */
self.global = self;
const engineVersion = new URL(self.location.href).search;
importScripts("/z3/z3-built.js", `/z3/engine.js${engineVersion}`);
self.onmessage = async (event) => {
  const { requestId } = event.data;
  try {
    if (!self.crossOriginIsolated) throw new Error("需要 COOP/COEP 跨源隔离才能运行 Z3 WASM。");
    const result = await ClocktowerZ3.handle(event.data, (progress) => self.postMessage({ requestId, progress }));
    self.postMessage({ requestId, result });
  } catch (error) {
    self.postMessage({ requestId, error: error instanceof Error ? error.message : String(error) });
  }
};
