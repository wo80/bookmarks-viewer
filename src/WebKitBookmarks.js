// WebKit uses a few special root folders, which need to be mapped manually
//
// [0]	roots.bookmark_bar
// [1]	roots.custom_root.userRoot
// [2]	roots.other
//
// Ignore:
// [3]	roots.custom_root.shared
// [4]	roots.custom_root.unsorted
// [5]	roots.synced
// [6]	roots.trash
//
// Ignore: roots.custom_root.userRoot._reading_list_

export class WebKitBookmarks {
  constructor(data) {
    this.data = data;
  }

  /**
   * Returns true, if given object can be parsed as Mozilla json bookmarks.
   * 
   * @param {Types.MozJsonBookmark} obj
   */
  static validate(obj) {
		return obj.checksum && obj.roots && obj.version === 1;
  }
  
  select(path) {
    if (path.length === 0) {
      return this.#root();
    }

    const folder = this.#find_folder(this.data, path);
    const items = folder.content;

    let sub = [], bmk = [];

    for (let i = 0; i < items.length; i++) {
      const o = items[i];

      if (this.#is_bookmark(o)) {
        bmk.push({ title: o.name, uri: o.url });
      } else if (this.#is_folder(o)) {
        if (o.name === "_reading_list_") {
          continue;
        }
        sub.push({ title: o.name, path: path.concat(i), stats: this.#stats(o) });
      }
    }

    return {
      folders: sub,
      bookmarks: bmk,
      path: folder.path
    };
  }

  search(text) {
    return { count: 0 }; // not implemented
  }

  #is_bookmark(obj) {
    return obj.type === 'url';
  }

  #is_folder(obj) {
    return obj.type === 'folder';
  }

  #stats(folder) {
    var bookmarksCount = 0, folderCount = 0;
    
    for (const i of folder.children) {
      if (this.#is_bookmark(i)) {
        bookmarksCount++;
      } else if (this.#is_folder(i)) {
        folderCount++;
      }
    }

    return { bookmarks: bookmarksCount, folders: folderCount };
  }
  
  #find_folder = function(data, path) {
    let o, p = [];

    // Special root folder mapping
    if (path[0] === 0) {
      o = data.roots.bookmark_bar;
    } else if (path[0] === 1) {
      o = data.roots.custom_root.userRoot;
    } else if (path[0] === 2) {
      o = data.roots.other;
    } else {
      throw new Error("Invalid path: unsupported root mapping");
    }

    let folder = o.children;
    p.push(o.name);

    if (path.length > 1) {
      for (let i = 1; i < path.length; i += 1) {
        let k = path[i];
        p.push(folder[k].name);
        folder = folder[k].children;
        if (!folder) {
          throw new Error("Invalid path: element has no children");
        }
      }
    }

    return { content: folder, path: p };
  }

  #root() {
    // Get top level folders (see special path mapping).
    let sub = [], roots = this.data.roots;

    let o = roots.bookmark_bar;
    if (o) {
      sub.push({ title: o.name, path: [0], stats: this.#stats(o) });
    }

    /* No longer used in latest Chrome versions? */
    if (roots.custom_root) {
      o = roots.custom_root.userRoot
      if (o) {
        sub.push({ title: o.name, path: [1], stats: this.#stats(o) });
      }
    }

    o = roots.other;
    if (o) {
      sub.push({ title: o.name, path: [2], stats: this.#stats(o) });
    }

    return {
      folders: sub,
      bookmarks: [],
      path: []
    };
  }
}
