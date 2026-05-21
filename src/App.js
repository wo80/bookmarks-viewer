import { DropTarget } from './DropTarget.js'
import { BookmarkDb } from './BookmarkDb.js'
import { HeaderView } from './components/HeaderView.js'
import { FolderView } from './components/FolderView.js'
import { BookmarkView } from './components/BookmarkView.js'
import { createElement } from './HtmlHelper.js'
import * as Types from './types.js';

class App {
  /**
   * App constructor.
   *
   * @param {HTMLElement} root - The app root element
   */
  constructor(root) {
    root.innerHTML = `
<aside class="folders"></aside>
<main>
  <header>
    <ul class="path"></ul>
    <div class="toolbar">
      <input class="search" type="text" placeholder="Search all bookmarks" />
    </div>
  </header>
  <div class="bookmarks"></div>
</main>
`;

    this.db = new BookmarkDb();

    new HeaderView(root.querySelector('main header'), this.db);
    new FolderView(root.querySelector('aside.folders'), this.db);
    new BookmarkView(root.querySelector('main .bookmarks'), this.db);

    // Close error message on click
    document.body.addEventListener('click', () => {
      let div = document.querySelector('.error');
      if (div) div.remove();
    });

    // Enable drag & drop
    if (window.File && window.FileReader) {
      new DropTarget('body', files => {
        let reader = new FileReader();
        reader.onloadend = (event) => {
          this.load(event.target.result);
        };
        reader.readAsText(files[0]);
      });
    }

    // Check for inline bookmarks data.
    const s = document.querySelector('script[type="application/json"]');
    if (s) {
      this.load(s.textContent);
    }
  }

  /**
   * Initialize the app with given json text.
   *
   * @param {string} text - The json bookmark data
   */
  load(text) {
    try {
      this.db.load(JSON.parse(text));
      this.db.select([]);
    } catch (e) {
      this.error("Error loading json data.", e);
    }
  }

  error(message, e) {
    if (message) {
      document.body.appendChild(createElement('div', ['error'], message));
    }
    console.error(message, e);
  }
}

/**
 * Create bookmarks viewer app.
 *
 * @param {HTMLElement} root - The app root element.
 */
export function createApp(root) {
  new App(root)
}
