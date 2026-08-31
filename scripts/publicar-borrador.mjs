// Publica el borrador: regenera el sitio y lo empuja a la rama gh-pages.
//
//   node scripts/publicar-borrador.mjs
//
// La rama gh-pages es solo salida: se reescribe entera cada vez y nunca se
// fusiona a master. Este script no toca master ni el sitio en produccion.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (args, cwd = raiz) => execFileSync("git", args, { cwd, encoding: "utf8" }).trim();

const rama = git(["rev-parse", "--abbrev-ref", "HEAD"]);
if (rama === "master") {
  throw new Error("estas en master. Cambia a v2 (o a la rama del borrador) antes de publicar.");
}
if (git(["status", "--porcelain"])) {
  throw new Error("hay cambios sin guardar. Haz commit antes de publicar el borrador.");
}

const commit = git(["rev-parse", "--short", "HEAD"]);
const salida = fs.mkdtempSync(path.join(os.tmpdir(), "asteria-borrador-"));
const arbol = fs.mkdtempSync(path.join(os.tmpdir(), "asteria-ghpages-"));

try {
  console.log("1/3 · generando el borrador…");
  execFileSync(process.execPath, [path.join(raiz, "scripts", "build-borrador.mjs"), salida], { stdio: "inherit" });

  console.log("2/3 · preparando la rama gh-pages…");
  fs.rmSync(arbol, { recursive: true, force: true });
  git(["fetch", "origin", "gh-pages"]);
  git(["worktree", "add", "-f", arbol, "origin/gh-pages", "--detach"]);
  git(["checkout", "-B", "gh-pages"], arbol);

  for (const f of fs.readdirSync(arbol)) {
    if (f !== ".git") fs.rmSync(path.join(arbol, f), { recursive: true, force: true });
  }
  fs.cpSync(salida, arbol, { recursive: true });
  fs.writeFileSync(path.join(arbol, ".nojekyll"), "");

  git(["add", "-A"], arbol);
  if (!git(["status", "--porcelain"], arbol)) {
    console.log("3/3 · el borrador ya estaba al dia, no hay nada que publicar.");
  } else {
    git(["commit", "-m", `Borrador de ${rama} (${commit})`], arbol);
    git(["push", "origin", "gh-pages"], arbol);
    console.log("3/3 · publicado.");
  }
  console.log("\nhttps://jesuscorderoc306-arch.github.io/asteria-bedazzled/");
  console.log("(GitHub tarda ~1 minuto en servir el cambio)");
} finally {
  try { git(["worktree", "remove", arbol, "--force"]); } catch {}
  fs.rmSync(salida, { recursive: true, force: true });
}
