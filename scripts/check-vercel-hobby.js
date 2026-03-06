import fs from 'fs';
import path from 'path';

const API_DIR = path.resolve(process.cwd(), 'api');
const LIMIT = 12;
const FUNCTION_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.ts']);

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (FUNCTION_EXTENSIONS.has(ext)) out.push(full);
  }
  return out;
}

const files = walk(API_DIR);
if (files.length > LIMIT) {
  const list = files.map((f) => ` - ${path.relative(process.cwd(), f)}`).join('\n');
  console.error(
    `Vercel Hobby allows max ${LIMIT} API functions. Found ${files.length}:\n${list}\n\nConsolidate routes before deploying.`
  );
  process.exit(1);
}

console.log(`Vercel Hobby function count check passed: ${files.length}/${LIMIT}`);
