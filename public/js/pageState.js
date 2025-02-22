/**
 * Manages overall page state and provides utilities for updating state and URL params.
 */

export let pageState = {
  columns: 40,
  rows: 32,
  windows: []
};

export function generateId() {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
}

/**
 * Updates the browser’s URL parameters with the latest pageState.
 */
export function updateQueryParameters() {
  const params = new URLSearchParams(window.location.search);
  params.set("pageState", JSON.stringify(pageState));
  const newUrl = window.location.pathname + "?" + params.toString();
  window.history.replaceState(null, "", newUrl);
}

/**
 * Removes a window’s stored state from pageState by ID.
 */
export function removeWindowState(id) {
  pageState.windows = pageState.windows.filter(s => s.id !== id);
  updateQueryParameters();
}

/**
 * Updates an existing window state with new properties and recalculates grid positions.
 * This also syncs everything to the URL.
 */
export function updateWindowState(win, newProps) {
  const stateObj = pageState.windows.find(s => s.id === win._stateId);
  if (!stateObj) return;

  Object.assign(stateObj, newProps);

  // Recompute grid-based coords if we changed size/position.
  if ("x" in newProps || "y" in newProps || "width" in newProps || "height" in newProps) {
    const { x, y, width, height } = stateObj;
    const { cellWidth, cellHeight } = getCellSizes();
    stateObj.gridX = x / cellWidth;
    stateObj.gridY = y / cellHeight;
    stateObj.gridWidth = width / cellWidth;
    stateObj.gridHeight = height / cellHeight;
  }

  updateQueryParameters();
}

/**
 * Since updateWindowState references getCellSizes,
 * we re-import it here to avoid circular dependencies.
 * Just be aware that it’s a dynamic import to keep references clean.
 */
async function getCellSizes() {
  const gridModule = await import('./grid.js');
  return gridModule.getCellSizes();
}
