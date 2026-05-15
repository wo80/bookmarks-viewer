import { createElement } from '../HtmlHelper.js'
import * as Types from '../types.js';

export class FolderView {
  /**
   * FolderView constructor.
   *
   * @param {HTMLElement} root - The views root element
   * @param {Types.BookmarkDb} db - The bookmark database
   */
  constructor(root, db) {
    /** @type {HTMLElement} */
    this.root = root;

    /** @type {Types.BookmarkDb} */
    this.db = db;
    
    db.subscribe('select', e => {
      this.update(e);
    });

    // Toggle folders on click
    root.addEventListener('click', (e) => {
      let el = e.target;

      // The clicked element might be a 'div', or one of it's
      // children ('a' or 'span').
      if (!el.classList.contains('folder')) {
        // Make sure it's the 'div' element, since the path
        // data is stored in that node.
        el = el.parentElement;
      }

      if (el.classList.contains('folder')) {
        this.db.select(el.path, { target: el });
        e.preventDefault();
      }
    });
  }

  /**
   * Handle click on a bookmarks folder to open or close the subtree.
   *
   * @param {HTMLElement} parent - Clicked tree node
   */
  update(folder) {
    const path = folder.path;

    const parent = folder.data ? folder.data.target : this.root;

    const next = parent.nextElementSibling;

    if (next && next.classList.contains('container')) {
      // A subtree exists, so close folder
      next.remove();
      parent.classList.remove(['active']);

      // TODO: instead of removing elements from the DOM on folder close
      // and re-add on opening a second time, one could just hide the
      // subtree and then check if it already exists and show again
    } else {
      // No subtree, so append folder
      const level = path.length;

      // TODO: stylesheet currently defines 5 levels, so we should 
      // consider checking for max-depth

      // The ne folder elements;
      let folders = [];

      for (const item of folder.folders) {
        let folder = createElement('div', ['folder']);

        folder.path = item.path;
        folder.appendChild(createElement('a', [], item.title, [{ name: 'href', value: '#' }]));

        if (item.stats.bookmarks > 0) {
          folder.appendChild(createElement('span', ['count'], item.stats.bookmarks + ''));
        }

        if (item.stats.folders === 0) {
          folder.classList.add(['empty']);
        }

        folders.push(folder);
      }

      if (level === 0) {
        this.root.append(...folders);
      } else {
        let container = createElement('div', ['container', 'L' + level]);
        container.append(...folders);
        parent.after(container);
      }

      // Set parent to active and append subfolders.
      parent.classList.add(['active']);
    }

    let current = this.root.querySelector('.selected');

    if (current) {
      // Remove current selection
      current.classList.remove(['selected']);
    }

    // Update selection
    parent.classList.add(['selected']);
  }
}
