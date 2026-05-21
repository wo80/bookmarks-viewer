/**
 * Callback for drop event.
 *
 * @callback dropCallback
 * @param {FileList} files - List of files.
 * @param {Event} event - The drop event object.
 */

/**
 * Helper class to handle dropping of files onto the browser window
 *
 * @param {string} selector - Bookmarks of current folder.
 * @param {dropCallback} callback - Bookmarks of current folder.
 * @return {HTMLElement[]} List of HTML elements containing the bookmarks.
 */
export function DropTarget(selector, callback) {
  const dropArea = document.querySelector(selector);

  this.preventDefaults = function(e) {
    e.stopPropagation();
    e.preventDefault();
  };

  this.drop = function(e) {
    callback(e.dataTransfer.files, e);
  };

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, this.preventDefaults, false);
  });

  dropArea.addEventListener('drop', this.drop, false);
}
