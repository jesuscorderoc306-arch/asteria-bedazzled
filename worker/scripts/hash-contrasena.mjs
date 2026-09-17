// Genera la huella de la contrasena del panel, sin que la contrasena salga de
// tu computadora ni quede escrita en ningun archivo.
//
//   node scripts/hash-contrasena.mjs
//
// Pega el resultado cuando wrangler lo pida:
//   npx wrangler secret put ADMIN_PASS_HASH
import { createInterface } from "node:readline";
import { huellaContrasena } from "../src/sesion.js";

const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
rl.stdoutMuted = false;
rl._writeToOutput = function (s) { if (!rl.stdoutMuted) rl.output.write(s); };
rl.question("Contraseña del panel (no se muestra): ", async (pass) => {
  rl.close();
  process.stdout.write("\n");
  if (pass.length < 10) { console.error("Usa al menos 10 caracteres."); process.exit(1); }
  console.log(await huellaContrasena(pass));
});
rl.stdoutMuted = true;
