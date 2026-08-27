/** JSON-LD for search + answer engines. Escapes so page text cannot break the script tag. */
export function jsonLdInnerHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/&/g, "\\u0026");
}
