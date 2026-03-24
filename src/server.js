/**
 * HTTP server for just_nodebook.
 * Serves the notebook UI and exposes an API for notebook operations and
 * cloud AI agent delegation (委派给云智能体).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createNotebook, createCell, addCell, updateCellContent, removeCell, setCellOutput, buildAgentPrompt, CELL_TYPES } = require('./notebook');
const { delegateToAgent } = require('./agent');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// In-memory notebook store (keyed by notebook id).
const notebooks = new Map();

// Initialise with a default notebook.
const defaultNotebook = addCell(
  createNotebook('My Notebook'),
  createCell(CELL_TYPES.CODE, '// Write your code here\nconsole.log("Hello, just_nodebook!");')
);
defaultNotebook.id = 'default';
notebooks.set('default', defaultNotebook);

// ─── MIME types ─────────────────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sendJson(res, statusCode, body) {
  const payload = JSON.stringify(body);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ─── Request router ───────────────────────────────────────────────────────────

async function handleRequest(req, res) {
  const { method, url } = req;
  const parsedUrl = new URL(url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // ── Static files ──────────────────────────────────────────────────────────
  if (method === 'GET' && !pathname.startsWith('/api/')) {
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    return serveStatic(res, path.join(PUBLIC_DIR, file));
  }

  // ── GET /api/notebooks/:id ────────────────────────────────────────────────
  const nbMatch = pathname.match(/^\/api\/notebooks\/([^/]+)$/);
  if (nbMatch) {
    const id = nbMatch[1];
    if (method === 'GET') {
      const nb = notebooks.get(id);
      if (!nb) return sendJson(res, 404, { error: 'Notebook not found' });
      return sendJson(res, 200, nb);
    }
  }

  // ── POST /api/notebooks/:id/cells ─────────────────────────────────────────
  const cellsMatch = pathname.match(/^\/api\/notebooks\/([^/]+)\/cells$/);
  if (cellsMatch) {
    const id = cellsMatch[1];
    if (method === 'POST') {
      const nb = notebooks.get(id);
      if (!nb) return sendJson(res, 404, { error: 'Notebook not found' });
      let body;
      try { body = await readBody(req); } catch { return sendJson(res, 400, { error: 'Invalid JSON' }); }
      const cell = createCell(body.type || CELL_TYPES.CODE, body.content || '');
      const updated = addCell(nb, cell);
      notebooks.set(id, updated);
      return sendJson(res, 201, cell);
    }
  }

  // ── PATCH /api/notebooks/:id/cells/:cellId ────────────────────────────────
  const cellMatch = pathname.match(/^\/api\/notebooks\/([^/]+)\/cells\/([^/]+)$/);
  if (cellMatch) {
    const [, id, cellId] = cellMatch;
    const nb = notebooks.get(id);
    if (!nb) return sendJson(res, 404, { error: 'Notebook not found' });

    if (method === 'PATCH') {
      let body;
      try { body = await readBody(req); } catch { return sendJson(res, 400, { error: 'Invalid JSON' }); }
      const updated = updateCellContent(nb, cellId, body.content ?? '');
      notebooks.set(id, updated);
      const cell = updated.cells.find((c) => c.id === cellId);
      if (!cell) return sendJson(res, 404, { error: 'Cell not found' });
      return sendJson(res, 200, cell);
    }

    if (method === 'DELETE') {
      const updated = removeCell(nb, cellId);
      notebooks.set(id, updated);
      return sendJson(res, 200, { deleted: true });
    }
  }

  // ── POST /api/notebooks/:id/cells/:cellId/delegate ────────────────────────
  const delegateMatch = pathname.match(/^\/api\/notebooks\/([^/]+)\/cells\/([^/]+)\/delegate$/);
  if (delegateMatch && method === 'POST') {
    const [, id, cellId] = delegateMatch;
    const nb = notebooks.get(id);
    if (!nb) return sendJson(res, 404, { error: 'Notebook not found' });
    const cell = nb.cells.find((c) => c.id === cellId);
    if (!cell) return sendJson(res, 404, { error: 'Cell not found' });

    const prompt = buildAgentPrompt(cell);
    const result = await delegateToAgent(prompt);

    if (!result.success) {
      return sendJson(res, 502, { error: result.error || 'Agent delegation failed' });
    }

    const updatedNb = setCellOutput(nb, cellId, result.response);
    notebooks.set(id, updatedNb);
    return sendJson(res, 200, { response: result.response });
  }

  sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error('Unhandled error:', err);
    sendJson(res, 500, { error: 'Internal server error' });
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`just_nodebook server running at http://localhost:${PORT}`);
  });
}

module.exports = { server, notebooks };
