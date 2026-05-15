import { MozBookmarks } from './MozBookmarks.js'
import { WebKitBookmarks } from './WebKitBookmarks.js'
import * as Types from './types.js';

export class BookmarkDb {
  /** @type {MozBookmarks} */
  #backend;
  
  #callbacks = { 'select': [], 'search': [] };

  constructor() {
    this.#backend = null;
  }

  /**
   * Gets the root element of the bookmarks object.
   * 
   * @return {Types.MozJsonBookmark} The root element of the bookmarks object.
   */
  get root() {
    return this.#backend.root;
  }

  load(json) {
    if (MozBookmarks.validate(json)) {
      this.#backend = new MozBookmarks(json);
    } else if (WebKitBookmarks.validate(json)) {
      this.#backend = new WebKitBookmarks(json);
    } else {
      throw new Error("Unknown json format");
    }
  }

  unload() {
    this.#callbacks = { 'select': [], 'search': [] };
  }

  subscribe(eventType, callback) {
    if(typeof callback !== 'function') return;

    if(Object.hasOwn(this.#callbacks, eventType)) {
      this.#callbacks[eventType].push(callback);
    }
  }

  select(path) {
    const result = this.#backend.select(path);

    for (const listener of this.#callbacks['select']) {
      listener(result);
    }

    return result;
  }

  search(text) {
    const result = this.#backend.search(text);

    for (const listener of this.#callbacks['search']) {
      listener(result);
    }

    return result;
  }
}