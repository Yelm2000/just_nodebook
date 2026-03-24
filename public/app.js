/**
 * just_nodebook – frontend application script.
 * Manages notebook state, renders cells, and handles delegation to the
 * cloud AI agent (委派给云智能体).
 */

const NOTEBOOK_ID = 'default';
const API_BASE = '/api/notebooks/' + NOTEBOOK_ID;

// ─── State ────────────────────────────────────────────────────────────────────
let notebook = null;

// ─── DOM references ───────────────────────────────────────────────────────────
const container = document.getElementById('notebook-container');
const loading = document.getElementById('loading');
const agentPanel = document.getElementById('agent-panel');
const agentPanelBody = document.getElementById('agent-panel-body');
const agentPanelClose = document.getElementById('agent-panel-close');
const btnAddCode = document.getElementById('btn-add-code');
const btnAddMd = document.getElementById('btn-add-md');

// ─── Utilities ────────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`);
  return json;
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderNotebook(nb) {
  notebook = nb;
  loading.hidden = true;

  // Remove existing cell nodes (keep loading placeholder)
  Array.from(container.querySelectorAll('.cell')).forEach((n) => n.remove());

  if (!nb.cells.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = '没有单元格。点击上方按钮添加第一个单元格。';
    container.appendChild(empty);
    return;
  }
  container.querySelectorAll('.empty-state').forEach((n) => n.remove());
  nb.cells.forEach((cell) => container.appendChild(buildCellElement(cell)));
}

function buildCellElement(cell) {
  const div = document.createElement('div');
  div.className = `cell cell--${cell.type}`;
  div.dataset.cellId = cell.id;

  // Header
  const header = document.createElement('div');
  header.className = 'cell__header';

  const badge = document.createElement('span');
  badge.className = 'cell__type-badge';
  badge.textContent = cell.type === 'code' ? 'Code' : 'Markdown';

  const actions = document.createElement('div');
  actions.className = 'cell__header-actions';

  // Delegate button – 委派给云智能体
  const btnDelegate = document.createElement('button');
  btnDelegate.className = 'btn btn--agent';
  btnDelegate.title = '委派给云智能体 – Delegate to Cloud AI Agent';
  btnDelegate.textContent = '🤖 委派给云智能体';
  btnDelegate.addEventListener('click', () => handleDelegate(cell.id, btnDelegate));

  // Delete button
  const btnDelete = document.createElement('button');
  btnDelete.className = 'btn btn--icon btn--danger';
  btnDelete.title = '删除单元格';
  btnDelete.textContent = '🗑';
  btnDelete.addEventListener('click', () => handleDeleteCell(cell.id));

  actions.appendChild(btnDelegate);
  actions.appendChild(btnDelete);
  header.appendChild(badge);
  header.appendChild(actions);

  // Editor (textarea)
  const editor = document.createElement('textarea');
  editor.className = 'cell__editor';
  editor.value = cell.content;
  editor.placeholder = cell.type === 'code' ? '// 在此输入代码…' : '在此输入 Markdown 文本…';
  editor.spellcheck = false;
  editor.setAttribute('aria-label', `${cell.type} 单元格编辑器`);

  // Auto-save on blur
  editor.addEventListener('blur', () => handleUpdateCell(cell.id, editor.value));

  div.appendChild(header);
  div.appendChild(editor);

  // Output area (shown when agent responds)
  if (cell.output) {
    div.appendChild(buildOutputElement(cell.output));
  }

  return div;
}

function buildOutputElement(text) {
  const output = document.createElement('div');
  output.className = 'cell__output';
  const label = document.createElement('div');
  label.className = 'cell__output-label';
  label.textContent = '🤖 云智能体响应 / AI Agent Response';
  const content = document.createElement('div');
  content.textContent = text;
  output.appendChild(label);
  output.appendChild(content);
  return output;
}

// ─── API actions ──────────────────────────────────────────────────────────────
async function handleAddCell(type) {
  try {
    const cell = await apiFetch(`${API_BASE}/cells`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    });
    notebook = { ...notebook, cells: [...notebook.cells, cell] };
    container.querySelectorAll('.empty-state').forEach((n) => n.remove());
    container.appendChild(buildCellElement(cell));
    // Focus the new editor
    const el = container.querySelector(`[data-cell-id="${cell.id}"] .cell__editor`);
    if (el) el.focus();
  } catch (err) {
    alert('添加单元格失败: ' + err.message);
  }
}

async function handleUpdateCell(cellId, content) {
  try {
    await apiFetch(`${API_BASE}/cells/${cellId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
    // Update local state
    notebook = {
      ...notebook,
      cells: notebook.cells.map((c) => c.id === cellId ? { ...c, content } : c),
    };
  } catch (err) {
    console.error('自动保存失败:', err.message);
  }
}

async function handleDeleteCell(cellId) {
  if (!confirm('确定要删除此单元格吗？')) return;
  try {
    await apiFetch(`${API_BASE}/cells/${cellId}`, { method: 'DELETE' });
    notebook = { ...notebook, cells: notebook.cells.filter((c) => c.id !== cellId) };
    const el = container.querySelector(`[data-cell-id="${cellId}"]`);
    if (el) el.remove();
    if (!notebook.cells.length) {
      const empty = document.createElement('p');
      empty.className = 'empty-state';
      empty.textContent = '没有单元格。点击上方按钮添加第一个单元格。';
      container.appendChild(empty);
    }
  } catch (err) {
    alert('删除单元格失败: ' + err.message);
  }
}

/**
 * Delegates the cell to the cloud AI agent (委派给云智能体).
 * @param {string} cellId
 * @param {HTMLButtonElement} btn
 */
async function handleDelegate(cellId, btn) {
  const cellEl = container.querySelector(`[data-cell-id="${cellId}"]`);

  // Save latest content first
  const editor = cellEl && cellEl.querySelector('.cell__editor');
  if (editor) {
    await handleUpdateCell(cellId, editor.value);
  }

  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = '⏳ 委派中…';

  // Show agent panel as loading
  agentPanelBody.textContent = '正在联系云智能体，请稍候…\nContacting cloud AI agent, please wait…';
  agentPanel.hidden = false;

  try {
    const result = await apiFetch(`${API_BASE}/cells/${cellId}/delegate`, { method: 'POST' });

    // Update panel
    agentPanelBody.textContent = result.response;

    // Update/add output in cell
    if (cellEl) {
      let outputEl = cellEl.querySelector('.cell__output');
      if (!outputEl) {
        outputEl = buildOutputElement(result.response);
        cellEl.appendChild(outputEl);
      } else {
        outputEl.querySelector('div:last-child').textContent = result.response;
      }
    }

    // Update local state
    notebook = {
      ...notebook,
      cells: notebook.cells.map((c) => c.id === cellId ? { ...c, output: result.response } : c),
    };
  } catch (err) {
    agentPanelBody.textContent = '委派失败 / Delegation failed:\n' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = originalText;
  }
}

// ─── Initialisation ───────────────────────────────────────────────────────────
async function init() {
  try {
    const nb = await apiFetch(API_BASE);
    renderNotebook(nb);
  } catch (err) {
    loading.textContent = '加载笔记本失败: ' + err.message;
  }
}

// ─── Event listeners ──────────────────────────────────────────────────────────
btnAddCode.addEventListener('click', () => handleAddCell('code'));
btnAddMd.addEventListener('click', () => handleAddCell('markdown'));
agentPanelClose.addEventListener('click', () => { agentPanel.hidden = true; });

init();
