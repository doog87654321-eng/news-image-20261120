// news-image-20261120 entry: a one-page newspaper front page summing up
// Friday 20 November 2026, rendered from news.html into entry.png
// (Node 22, standard library only).
//
// This program copies that image into the output directory and checks it
// still satisfies the competition gate: a complete PNG, at most 1 MiB,
// at most 1024 by 1024 pixels. Both grading runs therefore write
// byte-identical output.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// package.json marks this directory as an ES module, so Node runs main.ts
// without a module-type warning.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here: string = dirname(fileURLToPath(import.meta.url));
const source: string = join(here, 'entry.png');
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const target: string = join(outDir, 'entry.png');

// Read the image and check the gate before writing anything.
const bytes: Buffer = readFileSync(source);
const PNG_MAGIC: Buffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
if (!bytes.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error('entry.png is not a PNG file');
}
if (bytes.length > 1048576) {
  throw new Error(`entry.png is ${bytes.length} bytes, over the 1 MiB limit`);
}
const width: number = bytes.readUInt32BE(16);
const height: number = bytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
// A complete PNG ends with its IEND chunk; a truncated file would still
// pass the header and size checks, so verify the trailer as well.
const IEND: Buffer = Buffer.from([
  0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);
if (!bytes.subarray(bytes.length - 12).equals(IEND)) {
  throw new Error('entry.png does not end with an IEND chunk (truncated?)');
}

mkdirSync(outDir, { recursive: true });
copyFileSync(source, target);
console.log(
  `wrote ${target} (${statSync(target).size} bytes, ${width}x${height})`,
);
