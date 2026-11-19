import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

// Exercise the same TypeScript implementation shipped in the app.
const source = fs.readFileSync(new URL("../src/lib/content-safety.ts", import.meta.url), "utf8");
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { safeExternalUrl, safeChartColor, safeCssIdentifier } =
  await import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));

test("external navigation rejects executable, ambiguous and credential-bearing URLs", () => {
  for (const value of [
    "javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\nscript:alert(1)",
    "data:text/html,<script>alert(1)</script>", "vbscript:msgbox(1)",
    "//attacker.example", "/relative", "http://example.org", "https://user:pass@example.org",
    " https://example.org", null, {},
  ]) assert.equal(safeExternalUrl(value), null);
  assert.equal(safeExternalUrl("https://www.youtube.com/watch?v=abcdefghijk"),
    "https://www.youtube.com/watch?v=abcdefghijk");
});

test("chart styles reject HTML breakouts and CSS declarations", () => {
  for (const value of [
    "</style><img src=x onerror=alert(1)>", "red; background:url(https://evil.example)",
    "url(javascript:alert(1))", "var(--x);color:red", "expression(alert(1))",
  ]) assert.equal(safeChartColor(value), null);
  for (const value of ["#fff", "#123456", "red", "hsl(var(--primary))", "rgb(20, 30, 40)"])
    assert.equal(safeChartColor(value), value);
  assert.match(safeCssIdentifier('x"]{}</style>'), /^[a-zA-Z0-9_-]+$/);
});

test("boot error and chart components do not parse injected HTML", () => {
  for (const path of ["../src/main.tsx", "../src/components/ui/chart.tsx"]) {
    const content = fs.readFileSync(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(content, /dangerouslySetInnerHTML|\.innerHTML\s*=/);
  }
});
