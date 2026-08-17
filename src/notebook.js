/**
 * Notebook core logic - manages cells and delegation to cloud AI agent.
 */

const CELL_TYPES = {
  CODE: 'code',
  MARKDOWN: 'markdown',
};

/**
 * Creates a new notebook cell.
 * @param {string} type - Cell type ('code' or 'markdown')
 * @param {string} [content=''] - Initial cell content
 * @returns {{ id: string, type: string, content: string, output: string|null }}
 */
function createCell(type = CELL_TYPES.CODE, content = '') {
  if (!Object.values(CELL_TYPES).includes(type)) {
    throw new Error(`Invalid cell type: ${type}. Must be one of: ${Object.values(CELL_TYPES).join(', ')}`);
  }
  return {
    id: `cell-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
    output: null,
  };
}

/**
 * Creates a new notebook.
 * @param {string} [title='Untitled Notebook'] - Notebook title
 * @returns {{ title: string, cells: Array }}
 */
function createNotebook(title = 'Untitled Notebook') {
  return {
    title,
    cells: [],
  };
}

/**
 * Adds a cell to the notebook.
 * @param {{ cells: Array }} notebook
 * @param {{ id: string, type: string, content: string }} cell
 * @returns {{ cells: Array }} Updated notebook
 */
function addCell(notebook, cell) {
  return {
    ...notebook,
    cells: [...notebook.cells, cell],
  };
}

/**
 * Updates a cell's content in the notebook.
 * @param {{ cells: Array }} notebook
 * @param {string} cellId
 * @param {string} content
 * @returns {{ cells: Array }} Updated notebook
 */
function updateCellContent(notebook, cellId, content) {
  return {
    ...notebook,
    cells: notebook.cells.map((c) =>
      c.id === cellId ? { ...c, content } : c
    ),
  };
}

/**
 * Removes a cell from the notebook.
 * @param {{ cells: Array }} notebook
 * @param {string} cellId
 * @returns {{ cells: Array }} Updated notebook
 */
function removeCell(notebook, cellId) {
  return {
    ...notebook,
    cells: notebook.cells.filter((c) => c.id !== cellId),
  };
}

/**
 * Sets the output on a cell (e.g. after AI agent delegation).
 * @param {{ cells: Array }} notebook
 * @param {string} cellId
 * @param {string} output
 * @returns {{ cells: Array }} Updated notebook
 */
function setCellOutput(notebook, cellId, output) {
  return {
    ...notebook,
    cells: notebook.cells.map((c) =>
      c.id === cellId ? { ...c, output } : c
    ),
  };
}

/**
 * Builds the prompt sent to the cloud AI agent for a given cell.
 * @param {{ type: string, content: string }} cell
 * @returns {string}
 */
function buildAgentPrompt(cell) {
  if (cell.type === CELL_TYPES.CODE) {
    return `Please analyze and explain the following code, then suggest improvements if any:\n\n\`\`\`\n${cell.content}\n\`\`\``;
  }
  return `Please review and improve the following markdown text:\n\n${cell.content}`;
}

module.exports = {
  CELL_TYPES,
  createCell,
  createNotebook,
  addCell,
  updateCellContent,
  removeCell,
  setCellOutput,
  buildAgentPrompt,
};
