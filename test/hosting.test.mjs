import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../', import.meta.url));

test('production build contains literal media URLs and no server files', async () => {
    const bundleDir = join(root, 'dist/assets');
    const bundles = (await readdir(bundleDir)).filter(name => name.endsWith('.js'));
    assert.ok(bundles.length > 0, 'Run npm run build before npm test');
    const code = (await Promise.all(bundles.map(name => readFile(join(bundleDir, name), 'utf8')))).join('\n');
    const mediaPaths = [...code.matchAll(/["'](\/?src\/assets\/[^"']+)["']/g)].map(match => match[1]);
    assert.ok(mediaPaths.length > 20, 'Expected canvas images and sounds in the bundle');
    for (const path of mediaPaths) {
        await readFile(join(root, 'dist', path.replace(/^\//, '')));
    }
    for (const path of ['.env', 'Firebase_ServiceAccount.json', 'src/Firebase/server.js', 'package.json']) {
        await assert.rejects(readFile(join(root, 'dist', path)), { code: 'ENOENT' });
    }
});

test('API starts with synthetic credentials and rejects removed reset routes', { timeout: 15000 }, async () => {
    const directory = await mkdtemp(join(tmpdir(), 'jumpgame-hosting-'));
    let child;
    let closed;
    try {
        const { privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
            publicKeyEncoding: { type: 'spki', format: 'pem' },
        });
        const credentialPath = join(directory, 'service-account.json');
        await writeFile(credentialPath, JSON.stringify({
            project_id: 'jumpgame-offline-test',
            client_email: 'test@jumpgame-offline-test.iam.gserviceaccount.com',
            private_key: privateKey,
        }));
        child = spawn(process.execPath, ['src/Firebase/server.js'], {
            cwd: root,
            env: { ...process.env, FIREBASE_SERVICE_ACCOUNT: credentialPath, PORT: '0' },
            stdio: ['ignore', 'pipe', 'pipe'],
            windowsHide: true,
        });
        closed = once(child, 'close');
        let logs = '';
        child.stderr.on('data', chunk => { logs += chunk; });
        const base = await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`API startup timeout: ${logs}`)), 8000);
            child.once('error', error => { clearTimeout(timer); reject(error); });
            child.once('exit', code => { clearTimeout(timer); reject(new Error(`API exited ${code}: ${logs}`)); });
            child.stdout.on('data', chunk => {
                logs += chunk;
                const match = logs.match(/http:\/\/127\.0\.0\.1:(\d+)/);
                if (match) { clearTimeout(timer); resolve(match[0]); }
            });
        });
        const health = await fetch(`${base}/api/health`);
        assert.equal(health.status, 200);
        assert.deepEqual(await health.json(), { status: 'ok' });
        for (const path of ['/api/resetLeaderboard', '/api/resetLeaderboard/', '/API/RESETLEADERBOARD', '/.env', '/Firebase_ServiceAccount.json', '/@fs/etc/passwd']) {
            assert.equal((await fetch(`${base}${path}`)).status, 404, path);
        }
        assert.equal((await fetch(`${base}/api/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value: 'x'.repeat(9000) }),
        })).status, 413);
        // Never call a database endpoint: no real credentials or Firebase writes.
    } finally {
        if (child && child.exitCode === null) child.kill();
        if (closed) await closed;
        assert.ok(directory.startsWith(join(tmpdir(), 'jumpgame-hosting-')));
        await rm(directory, { recursive: true, force: true });
    }
});
