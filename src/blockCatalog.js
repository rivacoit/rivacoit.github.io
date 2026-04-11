/**
 * Parse block-based text files: each block is
 *   first line = slug (filename under ~/projects or ~/experiences)
 *   remaining lines = body for `cat <slug>`
 * Blocks are separated by a line containing only ### (with newlines around it).
 */

const BLOCK_SPLIT = /\r?\n###\r?\n/g;

export function parseBlockCatalog(raw) {
  const text = raw.replace(/^\uFEFF/, "");
  const blocks = text.split(BLOCK_SPLIT);
  const bySlug = Object.create(null);
  const slugs = [];

  for (const rawBlock of blocks) {
    const block = rawBlock.trim();
    if (!block) continue;

    const nl = block.indexOf("\n");
    const id = (nl === -1 ? block : block.slice(0, nl)).trim();
    if (!id) continue;

    const body = nl === -1 ? "" : block.slice(nl + 1).trimEnd();

    if (!(id in bySlug)) {
      slugs.push(id);
    }
    bySlug[id] = body === "" ? "(no description yet)" : body;
  }

  return { bySlug, slugs };
}

export async function fetchBlockCatalog(filename) {
  const base = import.meta.env.BASE_URL ?? "/";
  const root = base.endsWith("/") ? base : `${base}/`;
  const url = `${root}${filename}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${filename}: HTTP ${res.status}`);
  }
  const text = await res.text();
  return parseBlockCatalog(text);
}
