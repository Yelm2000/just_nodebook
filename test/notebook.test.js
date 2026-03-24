/**
 * Tests for notebook core logic (src/notebook.js).
 */
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  CELL_TYPES,
  createCell,
  createNotebook,
  addCell,
  updateCellContent,
  removeCell,
  setCellOutput,
  buildAgentPrompt,
} = require('../src/notebook');

describe('createCell', () => {
  it('creates a code cell with default empty content', () => {
    const cell = createCell(CELL_TYPES.CODE);
    assert.equal(cell.type, 'code');
    assert.equal(cell.content, '');
    assert.equal(cell.output, null);
    assert.ok(cell.id.startsWith('cell-'));
  });

  it('creates a markdown cell with provided content', () => {
    const cell = createCell(CELL_TYPES.MARKDOWN, '# Hello');
    assert.equal(cell.type, 'markdown');
    assert.equal(cell.content, '# Hello');
  });

  it('throws on invalid cell type', () => {
    assert.throws(() => createCell('invalid'), /Invalid cell type/);
  });

  it('generates unique ids for each cell', () => {
    const a = createCell(CELL_TYPES.CODE);
    const b = createCell(CELL_TYPES.CODE);
    assert.notEqual(a.id, b.id);
  });
});

describe('createNotebook', () => {
  it('creates a notebook with the given title and empty cells', () => {
    const nb = createNotebook('My Notebook');
    assert.equal(nb.title, 'My Notebook');
    assert.deepEqual(nb.cells, []);
  });

  it('uses default title when none is provided', () => {
    const nb = createNotebook();
    assert.equal(nb.title, 'Untitled Notebook');
  });
});

describe('addCell', () => {
  it('appends a cell to the notebook', () => {
    const nb = createNotebook();
    const cell = createCell(CELL_TYPES.CODE, 'console.log(1)');
    const updated = addCell(nb, cell);
    assert.equal(updated.cells.length, 1);
    assert.equal(updated.cells[0].id, cell.id);
  });

  it('does not mutate the original notebook', () => {
    const nb = createNotebook();
    addCell(nb, createCell(CELL_TYPES.CODE));
    assert.equal(nb.cells.length, 0);
  });
});

describe('updateCellContent', () => {
  it('updates the content of the target cell', () => {
    let nb = createNotebook();
    const cell = createCell(CELL_TYPES.CODE, 'old content');
    nb = addCell(nb, cell);
    const updated = updateCellContent(nb, cell.id, 'new content');
    assert.equal(updated.cells[0].content, 'new content');
  });

  it('leaves other cells unchanged', () => {
    let nb = createNotebook();
    const a = createCell(CELL_TYPES.CODE, 'a');
    const b = createCell(CELL_TYPES.CODE, 'b');
    nb = addCell(addCell(nb, a), b);
    const updated = updateCellContent(nb, a.id, 'A');
    assert.equal(updated.cells[1].content, 'b');
  });
});

describe('removeCell', () => {
  it('removes the specified cell', () => {
    let nb = createNotebook();
    const cell = createCell(CELL_TYPES.CODE);
    nb = addCell(nb, cell);
    const updated = removeCell(nb, cell.id);
    assert.equal(updated.cells.length, 0);
  });

  it('is a no-op when cell id does not exist', () => {
    let nb = createNotebook();
    nb = addCell(nb, createCell(CELL_TYPES.CODE));
    const updated = removeCell(nb, 'non-existent-id');
    assert.equal(updated.cells.length, 1);
  });
});

describe('setCellOutput', () => {
  it('sets the output of the specified cell', () => {
    let nb = createNotebook();
    const cell = createCell(CELL_TYPES.CODE);
    nb = addCell(nb, cell);
    const updated = setCellOutput(nb, cell.id, 'Agent response here');
    assert.equal(updated.cells[0].output, 'Agent response here');
  });
});

describe('buildAgentPrompt', () => {
  it('generates a code prompt for code cells', () => {
    const cell = createCell(CELL_TYPES.CODE, 'const x = 1;');
    const prompt = buildAgentPrompt(cell);
    assert.ok(prompt.includes('const x = 1;'));
    assert.ok(prompt.toLowerCase().includes('code'));
  });

  it('generates a markdown prompt for markdown cells', () => {
    const cell = createCell(CELL_TYPES.MARKDOWN, '# Title');
    const prompt = buildAgentPrompt(cell);
    assert.ok(prompt.includes('# Title'));
    assert.ok(prompt.toLowerCase().includes('markdown'));
  });
});
