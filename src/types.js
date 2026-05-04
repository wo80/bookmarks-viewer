
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