import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync("public/index.html", "utf8");
const css = readFileSync("public/ux-simplificacao.css", "utf8");
const js = readFileSync("public/ux-simplificacao.js", "utf8");
test("first lesson CTA uses external listener and existing navigation", () => {
  assert.match(html, /class="ux-start"/);
  assert.match(html, />Começar agora<\/button>/);
  assert.match(html, /id="learn"/);
  assert.doesNotMatch(html, /class="ux-start"[^>]*onclick=/);
  assert.match(html, /src="ux-simplificacao\.js" defer/);
  assert.match(js, /addEventListener\('click'/);
  assert.match(js, /getElementById\('learn'\)/);
});
test("touch target and visible focus are accessible", () => {
  assert.match(css, /min-height:48px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
test("no lesson or storage keys changed by additive UI", () => {
  assert.match(html, /ux-simplificacao\.css/);
  assert.doesNotMatch(css + js, /localStorage|sessionStorage|indexedDB/);
});
