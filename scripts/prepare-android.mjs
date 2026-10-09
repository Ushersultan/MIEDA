import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";

const gradlePath = new URL("../android/app/build.gradle", import.meta.url);
let gradle = await readFile(gradlePath, "utf8");

const currentCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
if (!Number.isInteger(currentCode)) throw new Error("versionCode introuvable dans android/app/build.gradle");
const requestedCode = process.env.ANDROID_VERSION_CODE;
const nextCode = requestedCode ? Number(requestedCode) : Math.max(currentCode + 1, 12);
if (!Number.isInteger(nextCode) || nextCode <= currentCode) {
  throw new Error("ANDROID_VERSION_CODE doit être un entier supérieur au code local actuel");
}
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${nextCode}`)
  .replace(/versionName\s+"[^"]+"/, 'versionName "1.3.3"');

await writeFile(gradlePath, gradle, "utf8");
console.log(`Android configuré : version 1.3.3 (code ${nextCode})`);

// Reuse the church's existing icon for native launcher and splash assets.
const assetsDirectory = new URL("../assets/", import.meta.url);
await mkdir(assetsDirectory, { recursive: true });
for (const name of ["icon-only.png", "splash.png", "splash-dark.png"]) {
  await copyFile(new URL("../public/icon-512.png", import.meta.url), new URL(name, assetsDirectory));
}
console.log("Logo MIEDA prêt pour les icônes et l’écran de démarrage");
