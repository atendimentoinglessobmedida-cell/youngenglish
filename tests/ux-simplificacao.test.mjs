import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const html = readFileSync("public/index.html", "utf8");
const css = readFileSync("public/ux-simplificacao.css", "utf8");
test("first lesson CTA uses existing navigation without changing routes", () => {
  assert.match(html, /class="ux-start"[^>]*onclick="document\.getElementById\('learn'\)\.click\(\)"/);
  assert.match(html, />Começar agora<\/button>/);
  assert.match(html, /id="learn"/);
});
test("touch target and visible focus are accessible", () => {
  assert.match(css, /min-height:48px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
});
test("no lesson or storage keys changed by this additive UI", () => {
  assert.match(html, /ux-simplificacao\.css/);
  assert.doesNotMatch(css, /localStorage|sessionStorage|indexedDB/);
});
