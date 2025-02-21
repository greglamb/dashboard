# Office Dashboard

A single-page dashboard that uses [WinBox.js](https://nextapps-de.github.io/winbox/) to open resizable, draggable windows. You can right-click anywhere on the page to create a new window, and each window snaps to a predefined grid when moved or resized. It also saves window positions and sizes in the URL as query parameters.

## Setup

1. Make sure you have [WinBox.js](https://github.com/nextapps-de/winbox) dependencies in the same folder. In this repository, `winbox.bundle.min.js` and `winbox.min.css` are included for you.
2. Open `index.html` in your favorite browser.
3. For development, you can run a lightweight local server (such as `npx http-server` or `python -m http.server`) in the project directory so you can see changes in real time.

## Usage and Features

- **Create a Window:** Right-click on the background. When prompted for a URL, type in a valid URL. If you don’t enter a protocol (http or https), it will prepend `http://`.
- **Grid Snapping:** Windows will snap to a dynamic grid, which adjusts automatically when you resize your browser.
- **Saving Window States:** All open window states (position, size, and URL) are stored in your browser’s URL. You can bookmark or refresh the page to restore your layout.
- **Maximize / Restore:**
  - Clicking the maximize button toggles full screen for that window.
  - Right-clicking the maximize button restores the window to its default size.
- **Closing Windows:** Just click the close button in the title bar. The layout will update accordingly.

## Notes

- **Custom Title Bar Color:** The window bar is set to a darker blue (`#000C66`).
- **URL Updates:** Each time you create, move, or resize a window, the URL automatically updates. You can share or bookmark this URL to preserve your layout.
- **Dependencies:** The project is built on vanilla JavaScript, CSS, and HTML. No build tools needed.

Feel free to play around and modify the grid size, default widths, or other behaviors in `index.html`.
