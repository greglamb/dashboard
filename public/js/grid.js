import { pageState } from './pageState.js';

/**
 * Returns the current cell size (width, height) based on pageState columns/rows and the window size.
 */
export function getCellSizes() {
  const { columns, rows } = pageState;
  const w = window.innerWidth;
  const h = window.innerHeight;
  return {
    cellWidth: w / columns,
    cellHeight: h / rows
  };
}

/**
 * Updates the background CSS grid lines based on the current cell size.
 */
export function updateGrid() {
  const { cellWidth, cellHeight } = getCellSizes();

  document.body.style.backgroundImage = `
    linear-gradient(to right, rgba(0,0,0,0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0,0,0,0.15) 1px, transparent 1px)
  `;
  document.body.style.backgroundSize = `${cellWidth}px ${cellHeight}px`;
  document.body.style.backgroundPosition = "0 0";

  console.log(`Grid updated => cellWidth=${cellWidth.toFixed(2)}, cellHeight=${cellHeight.toFixed(2)}`);
}

/**
 * Snaps width/height to the nearest cell boundary.
 */
export function snapDimension(width, height, cellWidth, cellHeight) {
  const snappedW = Math.round(width / cellWidth) * cellWidth;
  const snappedH = Math.round(height / cellHeight) * cellHeight;
  return { snappedW, snappedH };
}

/**
 * Snaps top/left position to the nearest cell boundary (taking into account the current window’s width/height).
 */
export function snapPosition(left, top, width, height, cellWidth, cellHeight) {
  const right = left + width;
  const bottom = top + height;

  // X axis
  const nearestLeft = Math.round(left / cellWidth) * cellWidth;
  const nearestRight = Math.round(right / cellWidth) * cellWidth;
  const distLeft = Math.abs(left - nearestLeft);
  const distRight = Math.abs(right - nearestRight);
  const snappedX = distLeft <= distRight ? nearestLeft : nearestRight - width;

  // Y axis
  const nearestTop = Math.round(top / cellHeight) * cellHeight;
  const nearestBottom = Math.round(bottom / cellHeight) * cellHeight;
  const distTop = Math.abs(top - nearestTop);
  const distBottom = Math.abs(bottom - nearestBottom);
  const snappedY = distTop <= distBottom ? nearestTop : nearestBottom - height;

  return { snappedX, snappedY };
}
