// Headless browser stubs so the real game modules run under Node.
const fs = require("fs");
const ctxStub = new Proxy({}, {
  // memoize the noop per property: a fresh closure per canvas call makes
  // 50k-frame bot runs allocation-bound
  get: (t, p) => (p in t ? t[p] : (t[p] = () => {})),
  set: (t, p, v) => { t[p] = v; return true; },
});
globalThis.document = { getElementById: () => ({ getContext: () => ctxStub, width: 0, height: 0 }), title: "" };
globalThis.window = { addEventListener: () => {} };
globalThis.requestAnimationFrame = () => {};
globalThis.fetch = async (path) => ({ json: async () => JSON.parse(fs.readFileSync(path, "utf-8")) });
globalThis.Image = class { set src(v) { queueMicrotask(() => this.onload && this.onload()); } };
const _store = {};
globalThis.localStorage = {
  getItem: k => (k in _store ? _store[k] : null),
  setItem: (k, v) => { _store[k] = String(v); },
};
