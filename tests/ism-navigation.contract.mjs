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
test("four consistent tabs, pillars and secondary-page lesson targets", () => {
  const app = JSON.parse(
    fs.readFileSync(path.join(root, "src/ism/app/manifest.json")),
  ).app;
  if (app !== "travel") {
    let captured;
    const location = {
      pathname: "/conversation-lab.html",
      search: "",
      hash: "",
      href: "",
      protocol: "https:",
    };
    const header = { querySelector: () => null, querySelectorAll: () => [] };
    const bridge = {
      URLSearchParams,
      URL,
      location,
      ISMStrings: sandbox.ISMStrings,
      document: {
        currentScript: { dataset: { ismApp: app } },
        readyState: "loading",
        createElement: () => ({ setAttribute() {}, append() {} }),
        querySelector: (s) => (s === "header" ? header : { append() {} }),
        querySelectorAll: () => [],
        addEventListener() {},
      },
      window: {
        ISMNavigationKit: {
          mount: (config) => {
            captured = config;
            return {};
          },
        },
      },
    };
    bridge.globalThis = bridge;
    vm.runInNewContext(
      fs.readFileSync(
        path.join(root, "src/ism/shared/ism-static-adapter.js"),
        "utf8",
      ),
      bridge,
    );
    if (app === "young") {
      bridge.remember = false;
      bridge.progressKey = "fixture-profile-a";
      assert.equal(captured.canPersistResume(), false);
      assert.equal(captured.resumeScope(), "fixture-profile-a");
      bridge.remember = true;
      assert.equal(captured.canPersistResume(), true);
      bridge.progressKey = "fixture-profile-b";
      assert.equal(captured.resumeScope(), "fixture-profile-b");
    } else assert.equal(captured.canPersistResume(), true);
    captured.lessons();
    assert.equal(
      location.href,
      app === "business" ? "index.html#journey" : "index.html#levels",
    );
    if (app === "business") {
      bridge.show = () => {};
      bridge.lastLesson = () => ({ mid: 2, index: 1, lid: "2.2" });
      bridge.lessonStageSaved = () => "listen";
      assert.equal(captured.legacyResume(), "/index.html#lesson/2.2/listen");
    } else {
      bridge.render = () => {};
      bridge.lessons = [{ id: "elementary-01" }, { id: "elementary-02" }];
      bridge.done = new Set();
      bridge.answers = {};
      bridge.drafts = {};
      bridge.resumeLesson = null;
      assert.equal(captured.legacyResume(), null);
      if (app === "young") {
        bridge.resumeLesson = { id: "elementary-02", step: 3 };
        assert.equal(
          captured.legacyResume(),
          "/index.html?ismLesson=elementary-02&ismStage=3",
        );
      } else {
        bridge.done.add("elementary-01");
        assert.equal(captured.legacyResume(), "/index.html#lesson/1/0");
      }
    }
  }
  assert.deepEqual(Array.from(sandbox.ISMNavigationKit.tabs), [
    "Início",
    "Aulas",
    "Praticar",
    "Progresso",
    "Mais",
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
  assert.equal(lock.version, "0.2.0");
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

test("CTA invitation and installation suggestions require a native first completion", () => {
  const policy = sandbox.ISMProductModel.policy;
  for (const complete of [0, undefined, -1]) {
    assert.equal(policy({ complete }).invite, false);
    assert.equal(policy({ complete }).installSuggestion, false);
  }
  assert.equal(policy({ complete: 1 }).invite, true);
  assert.equal(policy({ complete: 1 }).installSuggestion, true);
});
test("five-question guidance reaches each track without changing entitlement", () => {
  const p = sandbox.ISMProductModel;
  assert.equal(p.questions.length, 5);
  for (let n = 0; n <= 5; n++) {
    const answers = p.questions.map((q, i) =>
      i < n ? q.answer : (q.answer + 1) % 3,
    );
    assert.equal(p.placement(answers).level, p.levels[n]);
    assert.equal(p.placement(answers).href, "index.html#level/" + n);
  }
  assert.equal(
    p.questions.some((q) => q.options.length !== 3),
    false,
  );
});
test("entry has useful static content and visible loading copy before scripts", () => {
  const app = JSON.parse(
    fs.readFileSync(path.join(root, "src/ism/app/manifest.json")),
  ).app;
  if (app === "travel") {
    assert.match(
      fs.readFileSync(path.join(root, "app/loading.tsx"), "utf8"),
      /Carregando suas aulas…/,
    );
    return;
  }
  const web = app === "business" ? "" : app === "easy" ? "web" : "public";
  const html = fs.readFileSync(path.join(root, web, "index.html"), "utf8");
  assert.match(html, /data-ism-loading role="status">Carregando suas aulas…/);
  assert.match(html, /data-ism-prepaint="true"/);
  assert.equal((html.match(/class="ism-primary"/g) || []).length, 1);
});
