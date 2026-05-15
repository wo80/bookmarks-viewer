import { createElement } from '../HtmlHelper.js'
import * as Types from '../types.js';

export class BookmarkView {
  /**
   * BookmarkView constructor.
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

    db.subscribe('search', e => {
      this.update(e);
    });
  }

  update(e) {
    const bookmarks = e.bookmarks;

    let ul = createElement('ul');

    if (e.type === 'select') {
      ul.append(...this.create_bookmarks(bookmarks));
      
    } else if (e.type === 'search') {
      for (const folder of e.folders) {
        // TODO: visualize folder path
        ul.append(...this.create_bookmarks(folder.items))
      }
      //highlight_search_results(ul, text);
    }

    this.root.replaceChildren(ul);
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
}
