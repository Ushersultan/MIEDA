import { readFile, writeFile } from "node:fs/promises";

const gradlePath = new URL("../android/app/build.gradle", import.meta.url);
let gradle = await readFile(gradlePath, "utf8");

gradle = gradle
  .replace(/versionCode\s+\d+/, "versionCode 11")
  .replace(/versionName\s+"[^"]+"/, 'versionName "1.3.2"');

await writeFile(gradlePath, gradle, "utf8");
console.log("Android configuré : version 1.3.2 (code 11)");
