
/**
 * Represents a Mozilla bookmark object
 * @typedef {Object} MozBookmark
 * @property {string} guid - The bookmark guid
 * @property {string} type - The bookmark type (for example "text/x-moz-place")
 * @property {number} typeCode - The bookmark type code (1 = x-moz-place, 2 = x-moz-place-container, 3 = x-moz-place-separator)
 * @property {number} id - The bookmark id
 * @property {string} title - The bookmark title
 * @property {string?} uri - The bookmark uri (only with type x-moz-place)
 * @property {string?} root - The bookmark folder root (only with type x-moz-place-container)
 * @property {MozBookmark[]?} children - The children (only with type x-moz-place-container)
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
 * @property {number} path - The folder path 
 */

/**
 * Represents a search result object
 * @typedef {Object} BookmarkSearchResult
 * @property {BookmarkFolder[]} folders - List of bookmark folders
 * @property {number} count - The total number of matches
 */

/**
 * Represents a folder object
 * @typedef {Object} Folder
 * @property {string} path - The bookmark path
 * @property {Object} count - Statistics
 */

export const Types = {};