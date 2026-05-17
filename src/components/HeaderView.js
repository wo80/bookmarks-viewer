import { createElement } from '../HtmlHelper.js'
import * as Types from '../types.js';

export class HeaderView {
  /**
   * HeaderView constructor.
   *
   * @param {HTMLElement} root - The views root element
   * @param {Types.BookmarkDb} db - The bookmark database
   */
  constructor(root, db) {
    /** @type {HTMLElement} */
    this.root = root;

    /** @type {Types.BookmarkDb} */
    this.db = db;

    db.subscribe('select', e => this.update(e));
    db.subscribe('search', e => this.update(e));
    
    // Search box key bindings
    root.querySelector('input.search').addEventListener('keyup', (e) => {
      if (e.keyCode === 13) { // Enter
        var text = e.currentTarget.value;
        if (text.length > 1) {
          this.db.search(text);
        }
      }
    });
  }

  update(e) {
    var items = [];
    for (const i of e.path) {
      items.push(createElement('li', ['item'], i));
    }
    this.root.querySelector('.path').replaceChildren(...items);
  }
}
