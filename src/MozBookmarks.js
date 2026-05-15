import * as Types from './types.js';

export class MozBookmarks {
  constructor(data) {
    /** @type {Types.MozJsonBookmark} */
    this.data = data;
  }

  /**
   * Select given path of the bookmarks folder tree and return its content.
   * 
   * @param {number[]} path
   * @return {Types.SelectResult} The select result object.
   */
  select(path) {
    if (!path) {
      throw new Error("Invalid path");
    }

    let folder = this.data.children, folder_names = [];
    
    // Trace given path and record folder names.
    for (let i of path) {
      folder_names.push(folder[i].title);
      folder = folder[i].children;
      if (!folder) {
        throw new Error("Invalid path: element has no children");
      }
    }

    let sub = [], bmk = [];

    // Collect items of selected folder.
    for (let i = 0; i < folder.length; i++) {
      const o = folder[i];

      if (this.#is_bookmark(o)) {
        bmk.push({ title: o.title, uri: o.uri });
      } else if (this.#is_folder(o)) {
        sub.push({ title: o.title, path: path.concat(i), stats: this.#stats(o) });
      }
    }

    return {
      folders: sub,
      bookmarks: bmk,
      path: folder_names
    };
  }

  /**
   * Search all bookmarks for given text
   *
   * @param {string} text - The string to search for
   * @return {Types.SearchResult} The search result object
   */
  search(text) {
    let total_matches = 0, folders = [], path = [];

    const regex = new RegExp(text, 'i');

    // Push root onto stack
    let stack = [{ folder: this.data, level: 0 }];

    // Loop as long as there are children on the stack (this
    // is a depth-first search of the subtree)
    while (stack.length > 0) {
      const c = stack.pop();
      const f = c.folder;

      // Current node has children
      if (f.children) {
        path.length = c.level;
        path.push(f.title);

        let items = [];

        for (const b of f.children) {
          let s = b.title || '';

          if (b.uri) {
            if (regex.test(s) || regex.test(b.uri)) {
              items.push({ title: s, uri: b.uri });
            }
          } else if (b.children) {
            // Push child node onto stack
            stack.push({ folder: b, level: c.level + 1 });
          }
        }

        if (items.length > 0) {
          total_matches += items.length;
          folders.push({ items: items, path: path.slice(1) });
        }
      }
    }

    return { count: total_matches, folders: folders };
  }

  /**
   * Returns true, if given object can be parsed as Mozilla json bookmarks.
   * 
   * @param {Types.MozJsonBookmark} obj
   */
  static validate(obj) {
    return obj.guid && obj.root === 'placesRoot' && obj.id === 1;
  }

  /**
   * Returns true, if given object is a bookmark.
   * 
   * @param {Types.MozJsonBookmark} obj
   */
  #is_bookmark(obj) {
    return obj.typeCode === 1;
  }

  /**
   * Returns true, if given object is a folder.
   * 
   * @param {Types.MozJsonBookmark} obj
   */
  #is_folder(obj) {
    return obj.typeCode === 2 && obj.children;
  }

  /**
   * Returns statistics for the current bookmark object.
   * 
   * @param {Types.MozJsonBookmark} obj
   */
  #stats(obj) {
    var bookmarksCount = 0, folderCount = 0;
    
    for (const i of obj.children) {
      if (this.#is_bookmark(i)) {
        bookmarksCount++;
      } else if (this.#is_folder(i)) {
        folderCount++;
      }
    }

    return { bookmarks: bookmarksCount, folders: folderCount };
  }
}
