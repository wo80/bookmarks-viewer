import { MozBookmarks } from './MozBookmarks.js'
import { WebKitBookmarks } from './WebKitBookmarks.js'
import * as Types from './types.js';

export class BookmarkDb {
  /** @type {MozBookmarks} */
  #backend = null;
  
  #callbacks = { 'select': [], 'search': [] };

  constructor() {
  }
  
  /**
   * Gets the name of the backend.
   * 
   * @return {string} The name of the backend
   */
  get backend() {
    if (this.#backend instanceof MozBookmarks) {
      return 'MozBookmarks';
    } else if (this.#backend instanceof WebKitBookmarks) {
      return 'WebKitBookmarks';
    }
    return '';
  }

  /**
   * Load the database backend.
   * 
   * @param {Object} json The json object containing the bookmarks
   */
  load(json) {
    if (MozBookmarks.validate(json)) {
      this.#backend = new MozBookmarks(json);
    } else if (WebKitBookmarks.validate(json)) {
      this.#backend = new WebKitBookmarks(json);
    } else {
      throw new Error("unknown json format");
    }
  }

  /**
   * Unload the database backend and clear callbacks.
   */
  unload() {
    this.#callbacks = { 'select': [], 'search': [] };
    this.#backend = null;
  }

  /**
   * Subscribe to 'select' or 'search' events.
   * 
   * @param {string} eventType The type of event to subscribe to
   * @param {function} callback The callback
   */
  subscribe(eventType, callback) {
    if(typeof callback !== 'function') return;

    if(Object.hasOwn(this.#callbacks, eventType)) {
      this.#callbacks[eventType].push(callback);
    }
  }

  /**
   * Select given path of the bookmarks folder tree and return its content.
   * 
   * @param {number[]} path The path of the folder to select
   * @param {any} data A general purpose payload that is passed to event listeners
   * @return {Types.SelectResult} The select result object.
   */
  select(path, data) {
    const result = this.#backend.select(path);

    result.type = 'select';
    result.data = data;

    for (const listener of this.#callbacks['select']) {
      listener(result);
    }

    return result;
  }

  /**
   * Search all bookmarks for given text
   *
   * @param {string} text - The string to search for
   * @return {Types.SearchResult} The search result object
   */
  search(text) {
    const result = this.#backend.search(text);

    result.type = 'search';
    result.path =  ['Search Results'];

    for (const listener of this.#callbacks['search']) {
      listener(result);
    }

    return result;
  }
}