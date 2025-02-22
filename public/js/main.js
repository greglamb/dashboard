import { pageState, generateId, updateQueryParameters } from './pageState.js';
import { updateGrid, getCellSizes } from './grid.js';
import { createSnappingWindow, winMap } from './snappingWindow.js';

/**
 * Read pageState from URL, recreate windows, and draw the grid lines.
 */
function initializePage() {
  const params = new URLSearchParams(window.location.search);
  const pageStateParam = params.get("pageState");

  if (pageStateParam) {
    try {
      const parsed = JSON.parse(pageStateParam);
      // Assign all top-level props to preserve existing references
      pageState.columns = parsed.columns;
      pageState.rows = parsed.rows;
      pageState.windows = parsed.windows || [];
    } catch (e) {
      console.error("Error parsing pageState:", e);
    }
  }

  updateGrid();
  pageState.windows.forEach(s => createSnappingWindow(s));
}

/**
 * Reposition and resize all windows when the browser resizes,
 * ensuring they remain within the screen and maintain grid alignment.
 */
function repositionWindows() {
  const { windows } = pageState;
  const { cellWidth, cellHeight } = getCellSizes();

  windows.forEach(state => {
    const win = winMap[state.id];
    if (!win) return;

    // Calculate new size based on grid ratio
    let newW = state.gridWidth * cellWidth;
    let newH = state.gridHeight * cellHeight;

    // Clamp width/height to window boundaries
    const maxW = window.innerWidth - 20;
    const maxH = window.innerHeight - 20;
    if (newW > maxW) newW = maxW;
    if (newH > maxH) newH = maxH;

    // Calculate new position based on grid ratio
    let newX = state.gridX * cellWidth;
    let newY = state.gridY * cellHeight;

    // Clamp x/y so windows don't go off screen
    if (newX + newW > window.innerWidth) {
      newX = window.innerWidth - newW;
    }
    if (newY + newH > window.innerHeight) {
      newY = window.innerHeight - newH;
    }
    if (newX < 0) newX = 0;
    if (newY < 0) newY = 0;

    win.move(newX, newY);
    win.resize(newW, newH);

    // Update stored state to match new clamped values
    state.x = newX;
    state.y = newY;
    state.width = newW;
    state.height = newH;

    // Update grid ratios
    state.gridX = newX / cellWidth;
    state.gridY = newY / cellHeight;
    state.gridWidth = newW / cellWidth;
    state.gridHeight = newH / cellHeight;
  });

  updateQueryParameters();
}

/**
 * Right-click on the empty space => prompt for a URL to create a new window.
 */
document.addEventListener("contextmenu", e => {
  if (e.target === document.body || e.target === document.documentElement) {
    e.preventDefault();
    const urlInput = prompt("Enter URL:");
    if (urlInput) {
      let url = urlInput.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = "http://" + url;
      }
      const newX = 10 + (pageState.windows.length * 20);
      const newY = 10 + (pageState.windows.length * 20);

      const newWinState = {
        id: generateId(),
        url,
        x: newX,
        y: newY,
        width: 400,
        height: 300,
        isMinimized: false,
        isMaximized: false,
        _savedUrl: ""
      };

      pageState.windows.push(newWinState);
      updateQueryParameters();
      createSnappingWindow(newWinState);
    }
  }
});

window.addEventListener("load", initializePage);
window.addEventListener("resize", () => {
  updateGrid();
  repositionWindows();
});
