import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

test("navigation presents four tabs and preserves the progress screen inside Profile", () => {
  const source = readFileSync(new URL("../public/ism-navigation.js", import.meta.url), "utf8");
  const window = vm.runInNewContext(source + "\n globalThis");
  assert.deepEqual(Array.from(window.ISMNavigationKit.tabs), ["Início", "Aulas", "Praticar", "Perfil"]);
  assert.match(source, /list\.append\(button\(ui\.label004,\(\)=>navigate\('progresso'\)/);
  assert.match(source, /tab==='progresso'/);
});
