
/**
 * Represents a Mozilla bookmark object
 * @typedef {object} MozJsonBookmark
 * @property {string} guid - The bookmark guid
 * @property {string} type - The bookmark type (for example "text/x-moz-place")
 * @property {number} typeCode - The bookmark type code (1 = x-moz-place, 2 = x-moz-place-container, 3 = x-moz-place-separator)
 * @property {number} id - The bookmark id
 * @property {string} title - The bookmark title
 * @property {string?} uri - The bookmark uri (only with type x-moz-place)
 * @property {string?} root - The bookmark folder root (only with type x-moz-place-container)
 * @property {MozJsonBookmark[]?} children - The children (only with type x-moz-place-container)
 */

/**
 * Represents a WebKit bookmark object
 * @typedef {object} WebKitJsonBookmarkRoot
 * @property {string} checksum - The bookmark checksum
 * @property {{bookmark_bar: WebKitJsonBookmark, other: WebKitJsonBookmark}} roots - The bookmark root object
 * @property {number} version - The bookmark format version
 */

/**
 * Represents a WebKit bookmark object
 * @typedef {object} WebKitJsonBookmark
 * @property {string} guid - The bookmark guid
 * @property {string} id - The bookmark id
 * @property {string} name - The bookmark title
 * @property {string?} url - The bookmark uri (only with type 'url')
 * @property {string} type - The bookmark type ('folder' or 'url')
 * @property {WebKitJsonBookmark[]?} children - The children (only with type 'folder')
 */

/**
 * Represents a bookmark object
 * @typedef {Object} BookmarkDb
 * @property {MozJsonBookmark} root - ...
 * @property {(eventType: string, callback: function) => void} subscribe - ...
 * @property {(path: number[]) => SelectResult} select - ...
 * @property {(text: string) => SearchResult} search - ...
 */

/**
 * Represents a bookmark object
 * @typedef {Object} Bookmark
 * @property {string} title - The bookmark title
 * @property {string} uri - The bookmark uri 
 */

/**
 * Represents a folder object
 * @typedef {Object} BookmarkFolder
 * @property {Bookmark[]} items - Array of bookmarks in the folder
 * @property {string[]} path - The folder path
 */

/**
 * Represents a search result object
 * @typedef {Object} SearchResult
 * @property {BookmarkFolder[]} folders - List of folders containing matching bookmarks
 * @property {number} count - The total number of matches
 */

/**
 * Represents a select result object
 * @typedef {Object} SelectResult
 * @property {{title: string, path: number[], stats: {bookmarks:number, folders:number}}[]} folders - Subfolders of the selected path
 * @property {Bookmark[]} bookmarks - Bookmarks of the selected path
 * @property {string[]} path - The folder names of the selected path
 */

export const Types = {};
