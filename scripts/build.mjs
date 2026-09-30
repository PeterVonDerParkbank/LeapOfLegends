import { cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
await build({ root: projectRoot });

// Canvas images and sounds use literal URLs, which Vite cannot discover as imports.
// Copy only media, never the project root (which contains server credentials).
await cp(
    new URL('../src/assets/', import.meta.url),
    new URL('../dist/src/assets/', import.meta.url),
    { recursive: true },
);
