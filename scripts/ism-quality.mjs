import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
const root = process.cwd();
const app = JSON.parse(await fs.readFile("src/ism/app/manifest.json")).app;
const tasks =
  app === "business"
    ? ["test", "build"]
    : app === "easy"
      ? [
          "check",
          "test:security",
          "test:audio-assets",
          "test:podcasts",
          "build",
        ]
      : app === "young"
        ? ["test", "test:podcasts", "test:debate", "build"]
        : ["lint", "test", "typecheck"];
const mode = process.argv[2] || "verify";
function run(name) {
  if (!process.env.npm_execpath) throw Error("Execute com npm run verify");
  const r = spawnSync(
    process.execPath,
    [process.env.npm_execpath, "run", name],
    { stdio: "inherit", windowsHide: true },
  );
  if (r.status !== 0) throw Error("Falha: " + name);
}
async function lint() {
  for (const name of await fs.readdir("src/ism/shared")) {
    if (name.endsWith(".js"))
      new vm.Script(await fs.readFile("src/ism/shared/" + name, "utf8"), {
        filename: name,
      });
  }
  for (const file of [
    "ism-kit.lock.json",
    "src/ism/app/manifest.json",
    "src/ism/styles/tokens.json",
    "src/ism/strings/shared.pt-BR.json",
  ])
    JSON.parse(await fs.readFile(file));
  console.log(
    "ISM lint: sintaxe JS clássica e JSON válidos. TypeScript e lint legado permanecem na verificação do produto.",
  );
}
async function content() {
  const baseline = JSON.parse(
    await fs.readFile("src/ism/content/schemas/preserved-assets.json"),
  );
  if (baseline.schemaVersion !== 1 || !Array.isArray(baseline.files))
    throw Error("Manifesto de preservação inválido");
  for (const entry of baseline.files)
    if (
      typeof entry.path !== "string" ||
      !entry.path ||
      entry.path.split(/[\\/]/).includes("..") ||
      !/^[a-f0-9]{64}$/.test(entry.sha256)
    )
      throw Error("Entrada de conteúdo inválida");
  const errors = [];
  for (const entry of baseline.files) {
    try {
      const data = await fs.readFile(path.join(root, entry.path));
      if (
        crypto.createHash("sha256").update(data).digest("hex") !== entry.sha256
      )
        errors.push("Conteúdo alterado: " + entry.path);
    } catch {
      errors.push("Arquivo ausente: " + entry.path);
    }
  }
  if (errors.length) throw Error(errors.join("\n"));
  console.log(
    "ISM conteúdo: " +
      baseline.files.length +
      " arquivos pedagógicos/mídia preservados por hash. Validação semântica completa continua nos testes nativos; referências remotas não são aprovadas por este teste.",
  );
}
async function links() {
  const web =
    app === "business"
      ? root
      : path.join(root, app === "easy" ? "web" : "public");
  const failures = [];
  let checked = 0;
  for (const name of await fs.readdir(web)) {
    if (!name.endsWith(".html")) continue;
    const html = await fs.readFile(path.join(web, name), "utf8");
    for (const match of html.matchAll(/(?:href|src)=["']([^"'#?]+)["']/g)) {
      const value = match[1];
      if (/^(?:[a-z]+:|\/\/)/i.test(value)) continue;
      const href = value.split(/[?#]/)[0];
      if (!href || !path.extname(href) || href.includes("${")) continue;
      checked++;
      try {
        await fs.access(path.resolve(web, href.replace(/^\//, "")));
      } catch {
        failures.push({ page: name, target: href });
      }
    }
  }
  const accepted = JSON.parse(
    await fs.readFile("src/ism/content/schemas/legacy-link-debt.json"),
  );
  const added = failures.filter(
    (f) => !accepted.some((a) => a.page === f.page && a.target === f.target),
  );
  console.log(
    JSON.stringify(
      { checked, legacyMissing: failures, newMissing: added },
      null,
      2,
    ),
  );
  if (added.length) throw Error("Novos links locais ausentes");
}
async function budget() {
  const baseline = JSON.parse(
    await fs.readFile("src/ism/app/performance-budget.json"),
  );
  for (const [name, bytes] of Object.entries(baseline.files)) {
    const actual = (await fs.stat("src/ism/shared/" + name)).size;
    const limit = Math.ceil(bytes * (1 + baseline.tolerancePercent / 100));
    if (actual > limit)
      console.warn(
        "::warning::ISM bundle " +
          name +
          ": " +
          actual +
          " bytes; orçamento " +
          limit,
      );
    else
      console.log(
        "ISM bundle " + name + ": " + actual + " / " + limit + " bytes",
      );
  }
}
if (mode === "lint") await lint();
else if (mode === "content") await content();
else if (mode === "links") await links();
else if (mode === "budget") await budget();
else {
  run("format:check");
  run("test:ism");
  await lint();
  await budget();
  await content();
  await links();
  for (const task of tasks) run(task);
  console.log(
    "ISM verify concluído: " +
      app +
      ". Navegador, Lighthouse, aparelhos reais e backend autenticado exigem evidências separadas.",
  );
}

