import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("the first home practice shortcut opens the existing conversation lab directly", () => {
  const adapter = readFileSync(new URL("../public/ism-static-adapter.js", import.meta.url), "utf8");
  const shortcut = adapter.indexOf("props.shortcuts.unshift(link('Praticar agora','conversation-lab.html'))");
  assert.ok(shortcut >= 0 && shortcut < adapter.indexOf("window.ISMNavigationKit.mount(props)"));
  const activity = readFileSync(new URL("../public/conversation-lab.html", import.meta.url), "utf8");
  assert.match(activity, /id="activity"/);
});
