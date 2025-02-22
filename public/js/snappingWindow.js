import { pageState, removeWindowState, updateWindowState } from './pageState.js';
import { getCellSizes, snapDimension, snapPosition } from './grid.js';

/**
 * Maps window IDs to their WinBox instances, so we can reference them for resizing, etc.
 */
export const winMap = {};

/**
 * Creates and returns a new WinBox with snapping behavior, plus handling for minimize/maximize.
 * @param {Object} state - A window’s stored state (x, y, width, height, URL, etc.)
 */
export function createSnappingWindow(state) {
  console.log("Creating window => ", state);

  let myContainer = null;
  let positionTimer = null;
  let resizeTimer = null;
  let isSnappingPosition = false;
  let isSnappingDimension = false;
  const DEBOUNCE_MS = 200;

  // Provide some defaults
  if (typeof state._origWidth === "undefined") {
    state._origWidth = state.width || 400;
  }
  if (typeof state._origHeight === "undefined") {
    state._origHeight = state.height || 300;
  }
  if (typeof state.isMinimized === "undefined") {
    state.isMinimized = false;
  }
  if (typeof state.isMaximized === "undefined") {
    state.isMaximized = false;
  }

  const win = new WinBox({
    title: state.url,
    url: state.url,
    x: state.x,
    y: state.y,
    width: state.width || 400,
    height: state.height || 300,
    background: "#000C66",

    onmove: () => {
      clearTimeout(positionTimer);
      positionTimer = setTimeout(() => {
        if (!myContainer || isSnappingPosition) return;
        const rect = myContainer.getBoundingClientRect();
        const { cellWidth, cellHeight } = getCellSizes();
        const { snappedX, snappedY } = snapPosition(
          rect.left,
          rect.top,
          rect.width,
          rect.height,
          cellWidth,
          cellHeight
        );

        if (Math.abs(rect.left - snappedX) > 1 || Math.abs(rect.top - snappedY) > 1) {
          isSnappingPosition = true;
          console.log(`Snapping position from (${rect.left}, ${rect.top}) to (${snappedX}, ${snappedY})`);
          win.move(snappedX, snappedY);
          updateWindowState(win, { x: snappedX, y: snappedY });
          setTimeout(() => isSnappingPosition = false, DEBOUNCE_MS);
        } else {
          updateWindowState(win, { x: rect.left, y: rect.top });
        }
      }, DEBOUNCE_MS);
    },

    onresize: (width, height) => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!myContainer || isSnappingDimension) return;
        // If the window is nearly fullscreen, skip snapping
        if (width >= window.innerWidth - 10 && height >= window.innerHeight - 10) {
          console.log("Window nearly full screen => skip dimension snap");
          updateWindowState(win, { width, height });
          return;
        }

        const rect = myContainer.getBoundingClientRect();
        const { cellWidth, cellHeight } = getCellSizes();
        const { snappedW, snappedH } = snapDimension(rect.width, rect.height, cellWidth, cellHeight);

        if (Math.abs(rect.width - snappedW) > 1 || Math.abs(rect.height - snappedH) > 1) {
          isSnappingDimension = true;
          console.log(`Snapping dimension from (${rect.width}x${rect.height}) to (${snappedW}x${snappedH})`);
          win.resize(snappedW, snappedH);
          updateWindowState(win, { width: snappedW, height: snappedH });
          setTimeout(() => isSnappingDimension = false, DEBOUNCE_MS);
        } else {
          updateWindowState(win, { width: rect.width, height: rect.height });
        }
      }, DEBOUNCE_MS);
    },

    onclose: () => {
      console.log(`Window closed => ${state.url}`);
      removeWindowState(win._stateId);
    },

    onminimize: () => {
      if (!myContainer) return;
      console.log("Initial DOM at minimize =>", myContainer.outerHTML);

      // Capture current dimensions/position for restore
      const rect = myContainer.getBoundingClientRect();
      state._savedWidthBeforeMinimize = rect.width;
      state._savedHeightBeforeMinimize = rect.height;
      state._savedXBeforeMinimize = rect.left;
      state._savedYBeforeMinimize = rect.top;

      state.isMinimized = true;
      state.isMaximized = false;
      updateWindowState(win, { isMinimized: true, isMaximized: false });

      // Set background to black on minimize
      myContainer.style.background = "#000000";

      const iframe = myContainer.querySelector(".wb-body iframe");
      if (iframe) {
        const oldSrc = iframe.src;
        if (!state._savedUrl) {
          state._savedUrl = oldSrc;
        }
        // Use about:blank for the blank iframe
        iframe.src = "about:blank";
        console.log(`Changed iframe src from '${oldSrc}' to '${iframe.src}'`);
        console.log("After clearing iframe =>", myContainer.outerHTML);
      }
    },

    onmaximize: () => {
      if (!myContainer) return;
      console.log("Initial DOM at maximize =>", myContainer.outerHTML);

      state.isMinimized = false;
      state.isMaximized = true;
      updateWindowState(win, { isMinimized: false, isMaximized: true });

      // Set background back to blue on maximize
      myContainer.style.background = "#000C66";

      const iframe = myContainer.querySelector(".wb-body iframe");
      if (iframe && state._savedUrl) {
        const oldSrc = iframe.src;
        iframe.src = state._savedUrl;
        console.log(`Changed iframe src from '${oldSrc}' to '${iframe.src}'`);
      }

      console.log("After restoring iframe =>", myContainer.outerHTML);
    },

    onrestore: () => {
      if (!myContainer) return;
      console.log("Window restored =>", myContainer.outerHTML);

      state.isMinimized = false;
      state.isMaximized = false;
      updateWindowState(win, { isMinimized: false, isMaximized: false });

      // Set background back to blue on restore
      myContainer.style.background = "#000C66";

      // Restore the position/size from before minimize
      if (
        typeof state._savedWidthBeforeMinimize !== 'undefined' &&
        typeof state._savedHeightBeforeMinimize !== 'undefined' &&
        typeof state._savedXBeforeMinimize !== 'undefined' &&
        typeof state._savedYBeforeMinimize !== 'undefined'
      ) {
        win.move(state._savedXBeforeMinimize, state._savedYBeforeMinimize);
        win.resize(state._savedWidthBeforeMinimize, state._savedHeightBeforeMinimize);
        updateWindowState(win, {
          x: state._savedXBeforeMinimize,
          y: state._savedYBeforeMinimize,
          width: state._savedWidthBeforeMinimize,
          height: state._savedHeightBeforeMinimize
        });
      }

      const iframe = myContainer.querySelector(".wb-body iframe");
      if (iframe && state._savedUrl) {
        const oldSrc = iframe.src;
        iframe.src = state._savedUrl;
        console.log(`Restored iframe src from '${oldSrc}' to '${iframe.src}'`);
        console.log("After restoring iframe =>", myContainer.outerHTML);
      }
    }
  });

  // Slight delay to find the .winbox container in the DOM
  setTimeout(() => {
    const allBoxes = document.querySelectorAll('.winbox');
    const myIndex = allBoxes.length - 1;
    myContainer = allBoxes[myIndex];
    console.log("myContainer found =>", myContainer);

    // Right-click on maximize => restore default size
    const maxButton = myContainer.querySelector(".wb-max");
    if (maxButton) {
      maxButton.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        console.log("Right-click on maximize => restore default size");
        win.resize(state._origWidth, state._origHeight);
        updateWindowState(win, { width: state._origWidth, height: state._origHeight });
      });
    }

    // If minimized or maximized in the stored state, replicate that now
    if (state.isMinimized) {
      win.minimize();
    } else if (state.isMaximized) {
      win.maximize();
    } else {
      // If there's a saved iframe URL from earlier, restore it
      const iframe = myContainer.querySelector(".wb-body iframe");
      if (iframe && state._savedUrl) {
        iframe.src = state._savedUrl;
      }
    }
  }, 100);

  // Link the WinBox to the state ID
  win._stateId = state.id;
  winMap[state.id] = win;

  // Ensure we store grid coords if absent
  if (typeof state.gridX === "undefined") {
    const { cellWidth, cellHeight } = getCellSizes();
    state.gridX = state.x / cellWidth;
    state.gridY = state.y / cellHeight;
    state.gridWidth = state.width / cellWidth;
    state.gridHeight = state.height / cellHeight;
  }

  return win;
}
