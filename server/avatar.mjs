import sharp from "sharp";
export const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
export async function encodeAvatar(input) {
  if (!input.length || input.length > MAX_AVATAR_BYTES) throw new Error("INVALID_SIZE");
  const options = { limitInputPixels: 25_000_000, failOn: "warning" };
  const metadata = await sharp(input, options).metadata();
  if (!["jpeg", "png", "webp"].includes(metadata.format) || (metadata.pages ?? 1) > 1) {
    throw new Error("INVALID_IMAGE");
  }
  return sharp(input, options).rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 }).toBuffer();
}
