import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { encodeAvatar, MAX_AVATAR_BYTES } from "../server/avatar.mjs";
test("reject disguised text, SVG, empty and oversized uploads", async () => {
  for (const input of [Buffer.from("<html>not a photo</html>"), Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"/>'), Buffer.alloc(0), Buffer.alloc(MAX_AVATAR_BYTES + 1)]) {
    await assert.rejects(() => encodeAvatar(input));
  }
});
test("decode, resize, strip metadata and re-encode each allowed format", async () => {
  for (const format of ["jpeg", "png", "webp"]) {
    const input = await sharp({ create: { width: 1200, height: 20, channels: 3, background: "green" } }).toFormat(format).withMetadata().toBuffer();
    const result = await encodeAvatar(input);
    const metadata = await sharp(result).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, 1024);
    assert.equal(metadata.exif, undefined);
  }
});
