import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const sharp = createRequire(import.meta.resolve('@capacitor/assets/package.json'))('sharp');
const resources = new URL('../android/app/src/main/res/', import.meta.url);
const original = await readFile(new URL('../public/icon-512.png', import.meta.url));
assert((await readFile(new URL('../assets/icon-foreground.png', import.meta.url))).equals(original),
  'Adaptive source must be the unchanged MIEDA logo');
let verified = 0;
for (const directory of await readdir(resources)) {
  if (!/^mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)$/.test(directory)) continue;
  const actual = sharp(await readFile(new URL(`${directory}/ic_launcher_foreground.png`, resources)));
  const { width, height } = await actual.metadata();
  const expectedPixels = await sharp(original).resize(width, height).ensureAlpha().raw().toBuffer();
  const actualPixels = await actual.ensureAlpha().raw().toBuffer();
  assert(actualPixels.equals(expectedPixels), `${directory}: adaptive foreground is not the MIEDA logo`);
  const background = await sharp(await readFile(new URL(`${directory}/ic_launcher_background.png`, resources))).ensureAlpha().raw().toBuffer();
  assert(background.every(channel => channel === 255), `${directory}: background must be white`);
  verified++;
}
assert.equal(verified, 5, 'All five launcher density variants must be generated');
for (const filename of ['ic_launcher.xml', 'ic_launcher_round.xml']) {
  const xml = await readFile(new URL(`mipmap-anydpi-v26/${filename}`, resources), 'utf8');
  assert(xml.includes('@mipmap/ic_launcher_foreground') && xml.includes('@mipmap/ic_launcher_background'),
    `${filename}: adaptive layers are missing`);
}
console.log('Verified: original MIEDA logo in all five adaptive icon densities, white backgrounds and both launcher XML files.');
