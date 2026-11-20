// Screenshot news.html into entry.png with the local headless Chromium.
// Run: node render.mjs [output.png]   (default: entry.png beside this file)
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const htmlFile = join(here, 'news.html');
const outFile = resolve(process.argv[2] ?? join(here, 'entry.png'));
const chromeBin =
  '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux/chrome';

if (!existsSync(chromeBin)) {
  throw new Error('Chromium not found at ' + chromeBin);
}
if (!existsSync(htmlFile)) {
  throw new Error('news.html not found at ' + htmlFile);
}

execFileSync(
  chromeBin,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1024,1024',
    `--screenshot=${outFile}`,
    `file://${htmlFile}`,
  ],
  { stdio: 'inherit' },
);

const bytes = statSync(outFile).size;
console.log(`rendered ${outFile} (${bytes} bytes)`);
if (bytes > 1048576) {
  throw new Error('entry.png is over the 1 MiB limit');
}
