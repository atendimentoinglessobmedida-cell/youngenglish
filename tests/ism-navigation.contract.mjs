import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, ".."),
  tokens = JSON.parse(
    fs.readFileSync(path.join(root, "src/ism/styles/tokens.json")),
  ),
  sandbox = { URL };
sandbox.globalThis = sandbox;
vm.runInNewContext(
  fs.readFileSync(path.join(root, "src/ism/shared/ism-navigation.js"), "utf8"),
  sandbox,
);
function luminance(hex) {
  const values = hex
    .replace("#", "")
    .match(/../g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}
function contrast(a, b) {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
test("four consistent tabs and four pillars", () => {
  assert.deepEqual(Array.from(sandbox.ISMNavigationKit.tabs), [
    "Início",
    "Aulas",
    "Praticar",
    "Progresso",
  ]);
  assert.deepEqual(Array.from(sandbox.ISMNavigationKit.pillars), [
    "Aulas",
    "Revisão",
    "Situações",
    "Conversação",
  ]);
});
test("resume cannot leave origin, use script URLs, or bypass route validation", () => {
  const safe = sandbox.ISMNavigationKit.safeResume,
    allow = (u) =>
      /^#lesson\/\d+\/[0-5]$/.test(u.hash) &&
      u.pathname === "/index.html" &&
      !u.search;
  assert.equal(
    safe("/index.html#lesson/3/4", "https://ism.example", allow),
    "/index.html#lesson/3/4",
  );
  for (const value of [
    null,
    "",
    "javascript:alert(1)",
    "https://other.example/index.html#lesson/3/4",
    "/index.html?code=PRIVATE#lesson/3/4",
    "/index.html#lesson/3/99",
  ])
    assert.equal(safe(value, "https://ism.example", allow), null);
});
test("normal text and state labels meet AA token contrast in light and dark", () => {
  for (const mode of ["light", "dark"]) {
    const t = tokens[mode];
    for (const [fg, bg] of [
      ["--ism-ink", "--ism-paper"],
      ["--ism-muted", "--ism-bg"],
      ["--ism-success", "--ism-success-bg"],
      ["--ism-error", "--ism-error-bg"],
      ["--ism-warning", "--ism-warning-bg"],
    ])
      assert.ok(contrast(t[fg], t[bg]) >= 4.5, mode + ":" + fg);
    for (const [app, brand] of Object.entries(tokens.brands)) {
      assert.ok(
        contrast(brand[mode], t["--ism-paper"]) >= 4.5,
        app + ":link:" + mode,
      );
      assert.ok(
        contrast(t["--ism-on-brand"], brand[mode]) >= 4.5,
        app + ":button:" + mode,
      );
    }
  }
});
test("touch, type, spacing and motion are explicit contracts", () => {
  assert.equal(tokens.base["--ism-touch"], "44px");
  assert.equal(tokens.base["--ism-font-small"], "16px");
  for (const [k, v] of Object.entries(tokens.base).filter(([k]) =>
    k.startsWith("--ism-space-"),
  ))
    assert.equal(parseInt(v) % 4, 0, k);
  const css = fs.readFileSync(
    path.join(root, "src/ism/shared/ism-navigation.css"),
    "utf8",
  );
  assert.ok(css.includes("prefers-reduced-motion"));
  assert.ok(css.includes("safe-area-inset-bottom"));
  assert.ok(css.includes("prefers-color-scheme:dark"));
});

test("all synchronized release files match their locked SHA-256", () => {
  const lock = JSON.parse(
    fs.readFileSync(path.join(root, "ism-kit.lock.json")),
  );
  assert.equal(lock.version, "0.1.0");
  assert.ok(Object.keys(lock.files).length >= 4);
  for (const [name, record] of Object.entries(lock.files)) {
    const bytes = fs.readFileSync(path.join(root, name));
    assert.equal(
      crypto.createHash("sha256").update(bytes).digest("hex"),
      record.sha256,
      name,
    );
  }
});
