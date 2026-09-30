import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: projectRoot,
  server: {
    port: 5123,
    host: '127.0.0.1',
    proxy: {
      '/api': 'http://127.0.0.1:3000',
    },
    fs: {
      strict: true,
      allow: [projectRoot],
    },
    watch: {
      followSymlinks: false,
      ignored: [
        '/root/**',
        '/etc/**',
        '/run/**',
        '/apps/**',
      ],
    },
  }
});
