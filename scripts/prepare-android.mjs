import { readFile, writeFile } from "node:fs/promises";

const gradlePath = new URL("../android/app/build.gradle", import.meta.url);
let gradle = await readFile(gradlePath, "utf8");

const currentCode = Number(gradle.match(/versionCode\s+(\d+)/)?.[1]);
if (!Number.isInteger(currentCode)) throw new Error("versionCode introuvable dans android/app/build.gradle");
const nextCode = currentCode + 1;
gradle = gradle
  .replace(/versionCode\s+\d+/, `versionCode ${nextCode}`)
  .replace(/versionName\s+"[^"]+"/, 'versionName "1.3.3"');

await writeFile(gradlePath, gradle, "utf8");
console.log(`Android configuré : version 1.3.3 (code ${nextCode})`);
