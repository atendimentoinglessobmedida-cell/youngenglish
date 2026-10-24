const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
test('every registered game has a distinct, existing WebP cover and description', () => {
  const source = fs.readFileSync(path.join(root, 'public/games.js'), 'utf8');
  const literal = source.match(/const gameArtwork=([\s\S]*?);\s*function gameArt/)[1];
  const artwork = vm.runInNewContext('(' + literal + ')');
  const ids = new Set();
  for (const file of ['games.js', 'more-games.js', 'learning-games.js']) {
    const text = fs.readFileSync(path.join(root, 'public', file), 'utf8');
    for (const match of text.matchAll(/\{id:'([a-z]+)',title:/g)) ids.add(match[1]);
  }
  assert.equal(ids.size, 17);
  assert.deepEqual(Object.keys(artwork).sort(), [...ids].sort());
  const hashes = new Set();
  for (const id of ids) {
    const [url, alt] = artwork[id];
    assert.match(url, /^assets\/games\/[a-z]+-v1\.webp$/);
    assert.ok(alt.length > 25);
    const bytes = fs.readFileSync(path.join(root, 'public', url));
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert.ok(bytes.length > 10000 && bytes.length < 250000);
    hashes.add(crypto.createHash('sha256').update(bytes).digest('hex'));
  }
  assert.equal(hashes.size, 17, 'different filenames must not conceal duplicate images');
});
