/**
 * Integration tests for the HTTP server API (src/server.js).
 */
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');

// Import the server without starting it
const { server, notebooks } = require('../src/server');

let baseUrl;

before(() => new Promise((resolve) => {
  server.listen(0, '127.0.0.1', () => {
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
    resolve();
  });
}));

after(() => new Promise((resolve) => {
  server.close(resolve);
}));

/** Simple HTTP request helper */
function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('GET /api/notebooks/default', () => {
  it('returns the default notebook', async () => {
    const res = await request('GET', '/api/notebooks/default');
    assert.equal(res.status, 200);
    assert.equal(res.body.title, 'My Notebook');
    assert.ok(Array.isArray(res.body.cells));
    assert.ok(res.body.cells.length > 0);
  });
});

describe('GET /api/notebooks/:id (not found)', () => {
  it('returns 404 for unknown notebook', async () => {
    const res = await request('GET', '/api/notebooks/nonexistent');
    assert.equal(res.status, 404);
  });
});

describe('POST /api/notebooks/:id/cells', () => {
  it('creates a new code cell', async () => {
    const res = await request('POST', '/api/notebooks/default/cells', {
      type: 'code',
      content: 'const x = 42;',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.type, 'code');
    assert.equal(res.body.content, 'const x = 42;');
    assert.ok(res.body.id);
  });

  it('creates a markdown cell', async () => {
    const res = await request('POST', '/api/notebooks/default/cells', {
      type: 'markdown',
      content: '# Hello',
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.type, 'markdown');
  });
});

describe('PATCH /api/notebooks/:id/cells/:cellId', () => {
  it('updates cell content', async () => {
    // Add a cell first
    const createRes = await request('POST', '/api/notebooks/default/cells', {
      type: 'code',
      content: 'original',
    });
    const cellId = createRes.body.id;

    const patchRes = await request('PATCH', `/api/notebooks/default/cells/${cellId}`, {
      content: 'updated',
    });
    assert.equal(patchRes.status, 200);
    assert.equal(patchRes.body.content, 'updated');
  });
});

describe('DELETE /api/notebooks/:id/cells/:cellId', () => {
  it('deletes the specified cell', async () => {
    const createRes = await request('POST', '/api/notebooks/default/cells', {
      type: 'code',
      content: 'to be deleted',
    });
    const cellId = createRes.body.id;

    const delRes = await request('DELETE', `/api/notebooks/default/cells/${cellId}`);
    assert.equal(delRes.status, 200);
    assert.equal(delRes.body.deleted, true);

    // Verify it's gone
    const nb = await request('GET', '/api/notebooks/default');
    const found = nb.body.cells.find((c) => c.id === cellId);
    assert.equal(found, undefined);
  });
});

describe('POST /api/notebooks/:id/cells/:cellId/delegate', () => {
  it('delegates a cell to the cloud AI agent and returns a response', async () => {
    // Create a cell to delegate
    const createRes = await request('POST', '/api/notebooks/default/cells', {
      type: 'code',
      content: 'function add(a, b) { return a + b; }',
    });
    const cellId = createRes.body.id;

    const delegateRes = await request(
      'POST',
      `/api/notebooks/default/cells/${cellId}/delegate`
    );
    assert.equal(delegateRes.status, 200);
    assert.ok(typeof delegateRes.body.response === 'string');
    assert.ok(delegateRes.body.response.length > 0);
  });

  it('stores the agent response as cell output', async () => {
    const createRes = await request('POST', '/api/notebooks/default/cells', {
      type: 'markdown',
      content: '# My heading',
    });
    const cellId = createRes.body.id;

    await request('POST', `/api/notebooks/default/cells/${cellId}/delegate`);

    const nb = await request('GET', '/api/notebooks/default');
    const cell = nb.body.cells.find((c) => c.id === cellId);
    assert.ok(cell.output !== null);
    assert.ok(cell.output.length > 0);
  });

  it('returns 404 when delegating a non-existent cell', async () => {
    const res = await request(
      'POST',
      '/api/notebooks/default/cells/nonexistent/delegate'
    );
    assert.equal(res.status, 404);
  });
});

describe('Static file serving', () => {
  it('returns the index.html for /', async () => {
    return new Promise((resolve, reject) => {
      http.get(`${baseUrl}/`, (res) => {
        assert.equal(res.statusCode, 200);
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          assert.ok(data.includes('just_nodebook'));
          resolve();
        });
      }).on('error', reject);
    });
  });
});
