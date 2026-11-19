// Keep user text as React text children; never decode it into HTML.
// External navigation accepts HTTPS only, including when opening the native browser.
export function safeExternalUrl(value: unknown): string | null {
  if (typeof value !== "string" || /[\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

export function safeCssIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}

// Restrict chart configuration to literal colors or theme CSS variables.
// Never accept arbitrary CSS declarations, URLs, or markup.
export function safeChartColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return /^(?:#[\da-f]{3,8}|[a-z]+|(?:hsl|hsla|rgb|rgba)\([\d\s.,%+/-]+\)|(?:hsl|rgb)\(var\(--[a-z\d_-]+\)\)|var\(--[a-z\d_-]+\))$/i.test(value)
    ? value : null;
}
