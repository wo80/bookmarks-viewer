import * as Types from './types.js';

/**
 * Search bookmark nodes of the subtree for given text
 *
 * @param {string} text - The string to search for
 * @param {Object} root - The node to begin the search at
 * @return {Types.BookmarkSearchResult} The search result object
 */
var findBookmarks = function(text, root) {
  let k = 0, o = [], path = [],
    stack = [{ folder: root, level: 0 }]; // push root onto stack

  const regex = new RegExp(text, 'i');

  // Loop as long there are children on the stack (this is a
  // depth-first search of the subtree)
  while (stack.length > 0) {
    const c = stack.pop();
    const f = c.folder;

    // Current node has children
    if (f.children) {
      path.length = c.level;
      path.push(f.title);

      let items = [];

      for (let i = 0; i < f.children.length; i += 1) {
        let b = f.children[i];
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
        k += items.length;
        o.push({ items: items, path: path.slice(0) });
      }
    }
  }

  return { count: k, folders: o };
};

/**
 * Gets the children of the end node of given path.
 *
 * @param {Object} data - The bookmark data
 * @param {string[]} path - The path
 * @return {Object} The search result object
 */
var findFolder = function(data, path) {
  let folder = data.children, p = [];
  
  if (path) {
    for (let i of path) {
      p.push(folder[i].title);
      folder = folder[i].children;
      if (!folder) {
        throw new Error("Invalid path: element has no children");
      }
    }
  }

  return { content: folder, path: p };
};

export class MozBookmarks {
  constructor(data) {
    this.data = data;
  }

  isBookmark(obj) {
    return obj.title && obj.uri;
  }

  isFolder(obj) {
    return obj.title && obj.children;
  }
  
  isSeperator(obj) {
    return obj.type && obj.type === 'text/x-moz-place-separator';
  }

  countItems(folder) {
    var bookmarksCount = 0, folderCount = 0;
    
    for (const i of folder.children) {
      if (this.isBookmark(i)) {
        bookmarksCount++;
      } else if (this.isFolder(i)) {
        folderCount++;
      }
    }

    return { bookmarks: bookmarksCount, folders: folderCount };
  }

  get root() {
    return this.getRoot();
  }

  getRoot() {
    return this.getFolder([]).folders;
  }

  getFolder(path) {
    const folder = findFolder(this.data, path);
    const items = folder.content;
    
    let sub = [], bmk = [];

    for (let i = 0; i < items.length; i++) {
      const o = items[i];

      if (this.isBookmark(o)) {
        bmk.push({
          title: o.title,
          uri: o.uri
        });
      } else if (this.isFolder(o)) {
        let p = path.slice(0);
        p.push(i);

        sub.push({
          title: o.title,
          path: p,
          count: this.countItems(o)
        });
      }
    }

    return {
      folders: sub,
      bookmarks: bmk,
      path: folder.path
    };
  }


  /**
   * Search bookmarks for given text
   *
   * @param {string} text - The string to search for
   * @return {Types.BookmarkSearchResult} The search result object
   */
  search(text) {
    return findBookmarks(text, this.data);
  }

  static validate(data) {
    return data.guid && data.root === "placesRoot" && data.id === 1;
  }
}
