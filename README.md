# Office Dashboard

This single-page dashboard lets you open resizable, draggable windows via [WinBox.js](https://nextapps-de.github.io/winbox/). Once you open or move any window, the layout snaps to a dynamic grid and automatically saves all window positions and sizes in the page URL. That way, you can refresh or bookmark the page to preserve your exact layout. There’s also a minimize feature that turns the window black and replaces the iframe’s URL with `about:blank`, which helps reduce resource usage until you restore the window.

## Setup

1. Clone this repository, then make sure `winbox.bundle.min.js` and `winbox.min.css` are in the same folder as `index.html`. These are included in the repo by default.
2. Open `index.html` in your favorite browser. You can also run a lightweight server (e.g., `npx http-server` or `python -m http.server`) in the project folder if you prefer.
3. Right-click anywhere on the background to create a new window. If you don’t include `http://` or `https://` in the prompt, the script will prepend `http://`.

## Project Structure

- **index.html:** Basic HTML shell loading WinBox and our JavaScript files.
- **/js/pageState.js:** Manages the global `pageState` and updates query parameters.
- **/js/grid.js:** Handles the background grid, calculates cell sizes, and snapping logic.
- **/js/snappingWindow.js:** Creates new WinBox windows with snap and minimize/maximize handling.
- **/js/main.js:** Pulls it all together, initializes the page from the URL, and listens for user actions.

## Grid Snapping

- After you move or resize a window, the app automatically snaps it to a grid. The grid adjusts if you change your browser size, so windows stay organized on any screen resolution.
- The grid lines are visible in the background for clarity, but you can customize it in the CSS.

## Saving and Restoring Layout

- All open windows have their positions, sizes, and URLs stored in the browser’s query parameters.
- When you reload or bookmark the page, those windows reappear just as you left them.

## Minimize, Maximize, and Restore

- **Minimize:** Click the minimize button in the window’s top bar. It will save the original URL, change the iframe to `about:blank`, and turn the background black.
- **Maximize:** Click the maximize button to make the window go full screen. It restores the iframe to the saved URL if it was previously minimized.
- **Right-Click on Maximize:** Quickly restores the window to its default width and height.
- **Restore from Minimize:** Restores the original size, position, and iframe URL.

## Closing Windows

- Just click the close button. The remaining layout automatically updates in the query parameters.

## Additional Notes

- The window title bar is a darker blue (`#000C66`) to stand out.
- All functionality is done in vanilla JavaScript, CSS, and HTML. No frameworks or build tools required.
- Code is split into multiple files under the `js` folder for better maintainability and separation of concerns.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Created with Assistance

This project was created with the assistance of ChatGPT. Feel free to customize any parts of the code as needed.
