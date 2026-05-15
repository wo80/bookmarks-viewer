import { DropTarget } from './DropTarget.js'
import { BookmarkDb } from './BookmarkDb.js'
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

    /** @type {HTMLElement} */
    this.root = root;

    /** @type {HTMLElement} */
    this.folders = root.querySelector('aside.folders');

    /** @type {HTMLElement} */
    this.listview = root.querySelector('main .bookmarks');

    /** @type {BookmarkDb} */
    this.db = new BookmarkDb();

    // Toggle folders on click
    this.folders.addEventListener('click', (e) => {
      let folder = e.target;
      // The clicked element might be a 'div', or one of it's
      // children ('a' or 'span').
      if (!folder.classList.contains('folder')) {
        // Make sure it's the 'div' element, since the path
        // data is stored in that node.
        folder = folder.parentElement;
      }
      if (folder.classList.contains('folder')) {
        this.update_view(folder);
        e.preventDefault();
      }
    });

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
          this.initialize(event.target.result);
        };
        reader.readAsText(files[0]);
      });
    }

    // Check for inline bookmarks data.
    const s = document.querySelector('script[type="application/ld+json"]');
    if (s) {
      this.initialize(s.textContent);
    }
    
    // Search box key bindings
    root.querySelector('input.search').addEventListener('keyup', (e) => {
      if (e.keyCode === 13) { // Enter
        var text = e.currentTarget.value;
        if (text !== '') {
          this.search(text);
        }
      }
    });
  }

  /**
   * Initialize the app with given json text.
   *
   * @param {string} text - The json bookmark data
   */
  initialize(text) {
    try {
      this.load(JSON.parse(text));
    } catch (e) {
      this.error("Error loading json data.", e);
    }
  }

  /**
   * Load the json data.
   *
   * @param {Object} json - The json bookmark data
   */
  load(json) {
    this.db.load(json);

    this.folders.replaceChildren();
    this.listview.replaceChildren();
    
    const folders = this.db.root;

    for (const item of folders) {
      let folder = createElement('div', ['folder']);

      folder.path = item.path;
      folder.appendChild(createElement('a', [], item.title, [{ name: 'href', value: '#'}]));

      let stats = item.stats;

      if (stats.bookmarks > 0) {
        folder.appendChild(createElement('span', ['count'] , stats.bookmarks));
      }
      
      if (stats.folders === 0) {
        folder.classList.add(['empty']);
      }

      this.folders.appendChild(folder);
    }
  }

  /**
   * Handle click on a bookmarks folder to open or close the subtree.
   *
   * @param {HTMLElement} parent - Clicked tree node
   */
  update_view(parent) {
    const path = parent.path;

    const folder = this.db.select(path);

    if (parent.nextSibling && parent.nextSibling.classList.contains('container')) {
      // A subtree exists, so close folder
      parent.nextSibling.remove();
      parent.classList.remove(['active']);

      // TODO: instead of removing elements from the DOM on folder close
      // and re-add on opening a second time, one could just hide the
      // subtree and then check if it already exists and show again
    } else {
      // No subtree, so append folder
      const level = path.length;

      // TODO: stylesheet currently defines 5 levels, so we should 
      // consider checking for max-depth

      let container = createElement('div', ['container', 'L' + level]);

      for (const item of folder.folders) {
        let folder = createElement('div', ['folder']);

        folder.path = item.path;
        folder.appendChild(createElement('a', [], item.title, [{ name: 'href', value: '#'}]));

        if (item.stats.bookmarks > 0) {
          folder.appendChild(createElement('span', ['count'], item.stats.bookmarks + ''));
        }
        
        if (item.stats.folders === 0) {
          folder.classList.add(['empty']);
        }

        container.appendChild(folder);
      }

      // Set parent to active and append subfolders.
      parent.classList.add(['active']);
      parent.after(container);
    }

    let ul = createElement('ul');
    ul.replaceChildren(...this.create_bookmarks(folder.bookmarks));
    this.listview.replaceChildren(ul);

    let current = this.folders.querySelector('.selected');

    if (current) {
      // Remove current selection
      current.classList.remove(['selected']);
    }

    // Set path information
    this.update_path(this.root.querySelector('header .path'), folder.path);

    // Update selection
    parent.classList.add(['selected']);
  }
  
  /**
   * Update path.
   *
   * @param {HTMLElement} el - HTMLElement
   * @param {string[]} path - The path
   */
  update_path(el, path) {
    var items = [];
    for (const i of path) {
      items.push(createElement('li', ['item'], i));
    }
    el.replaceChildren(...items);
  }

  /**
   * Create bookmark elements.
   *
   * @param {Types.Bookmark[]} items - Bookmarks of current folder.
   * @return {HTMLElement[]} List of HTML elements containing the bookmarks.
   */
  create_bookmarks(items) {
    let nodes = [];

    for (const b of items) {
      let li = createElement('li', ['item']);
      let uri = createElement('div', ['uri']);
      uri.appendChild(createElement('a', [], b.uri, [{ name: 'href', value: b.uri}]));

      li.append(createElement('div', ['title'], b.title), uri);

      nodes.push(li);
    };
    
    return nodes;
  }

  search(text) {
    if (text.length < 1)  return;

    const result = this.db.search(text);

    if (result.count === 0) {
      this.listview.replaceChildren();
      return;
    }

    this.update_path(this.root.querySelector('header .path'), ['Search Results']);

    let ul = createElement('ul');
    for (const folder of result.folders) {
      // TODO: visualize folder path
      ul.append(...this.create_bookmarks(folder.items))
    }
    this.listview.replaceChildren(ul);
    
    //listview.unhighlight()
    //listview.highlight(text);
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
