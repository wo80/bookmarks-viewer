import { DropTarget } from './DropTarget.js'
import { MozBookmarks } from './MozBookmarks.js'
import { WebKitBookmarks } from './WebKitBookmarks.js'
import { createElement } from './HtmlHelper.js'
import * as Types from './types.js';

/** @type {MozBookmarks} */
let db;

/** @type {HTMLElement} */
let folders;
/** @type {HTMLElement} */
let listview;
/** @type {HTMLElement} */
let current = null;

/**
 * Handle click on a bookmarks folder to open or close the subtree.
 *
 * @param {HTMLElement} el - Clicked tree node
 */
var handleClick = function(el) {
  const path = el.path;

  const folder = db.getFolder(path);

  if (el.nextSibling && el.nextSibling.classList.contains('container')) {
    // A subtree exists, so close folder
    el.nextSibling.remove();
    el.classList.remove(['active']);

    // TODO: instead of removing elements from the DOM on folder close
    // and re-add on opening a second time, one could just hide the
    // subtree and then check if it already exists and show again...
  } else {
    // No subtree, so append folder
    appendFolder(el, folder.folders, path.length);
  }

  let ul = createElement('ul');
  ul.replaceChildren(...createBookmarks(folder.bookmarks));
  listview.replaceChildren(ul);

  if (current) {
    // Remove current selection
    current.classList.remove(['selected']);
  }

  // Set path information
  updatePath(document.getElementById('path'), folder.path);

  // Update selection
  el.classList.add(['selected']);
  current = el;
};

/**
 * Update path.
 *
 * @param {HTMLElement} el - HTMLElement
 * @property {string[]} path - The path
 */
var updatePath = function(el, path) {
  var items = [];
  for (const i of path) {
    items.push(createElement('li', ['item'], i));
  }
  el.replaceChildren(...items);
};

/**
 * Create bookmark elements.
 *
 * @param {Types.Bookmark[]} items - Bookmarks of current folder.
 * @return {HTMLElement[]} List of HTML elements containing the bookmarks.
 */
var createBookmarks = function(items) {
  let nodes = [];

  for (const b of items) {
    let li = createElement('li', ['bookmark']);
    let uri = createElement('div', ['uri']);
    uri.appendChild(createElement('a', [], b.uri, [{ name: 'href', value: b.uri}]));

    li.append(uri, createElement('div', ['title'], b.title));

    nodes.push(li);
  };
  
  return nodes;
};

/**
 * Display the next level of folders.
 *
 * @param {HTMLElement} parent - The selected node.
 * @param {Types.Folder[]} folders - Subfolders of current folder.
 * @param {Number} level - Level of current folder (depth of path in the tree).
 */
var appendFolder = function(parent, folders, level) {
  let container = createElement('div', ['container', 'L' + level]);

  for (const item of folders) {
    let folder = createElement('div', ['folder'], item.title);

    folder.path = item.path;

    if (item.count.bookmarks > 0) {
      folder.appendChild(createElement('span', ['count'], item.count.bookmarks + ''));
    }
    
    if (item.count.folders === 0) {
      folder.classList.add(['empty']);
    }

    container.appendChild(folder);
  }

  // Set parent to active and append subfolders.
  parent.classList.add(['active']);
  parent.after(container);
};

var loadRoot = function(json) {
  // Check Firefox bookmarks format
  if (MozBookmarks.validate(json)) {
    db = new MozBookmarks(json);
  } else if (WebKitBookmarks.validate(json)) {
    db = new WebKitBookmarks(json);
  } else {
    showError("Unknown JSON format");
    return;
  }

  let items = db.getRoot();

  for (const folder of items) {
    let el = createElement('div', ['folder'], folder.title);

    el.path = folder.path;

    let count = folder.count;

    if (count.bookmarks > 0) {
      el.appendChild(createElement('span', ['count'] , count.bookmarks));
    }
    
    if (count.folders === 0) {
      el.classList.add(['empty']);
    }

    folders.appendChild(el);
  }
};

/**
 * Load bookmarks from json object.
 *
 * @param {any} json - Bookmark data in json format
 */
var loadBookmarksFromJson = function(json) {
  folders.replaceChildren();
  listview.replaceChildren();

  try {
    loadRoot(json);
  } catch (error) {
    showError("Error loading json data.", error);
  }
};

/**
 * Load bookmarks from local json file
 *
 * @param {FileList} files - Files of drop event
 */
var loadBookmarksFromFile = function(files) {
  let reader = new FileReader();
  reader.onloadend = (event) => {
    loadBookmarksFromJson(JSON.parse(event.target.result));
  };
  reader.readAsText(files[0]);
};

var showError = function(message, error) {
  if (message) {
    var el = document.getElementById('error');
    el.textContent = message;
    el.style.display = 'block';
  }
  console.error(message, error);
};

var search = function(text) {
  if (text.length < 1)  return;

  const result = db.search(text);

  if (result.count === 0) {
    listview.replaceChildren();
    return;
  }

  updatePath(document.getElementById('path'), ['Search Results']);

  let ul = createElement('ul');
  for (const folder of result.folders) {
    // TODO: visualize folder path
    ul.append(...createBookmarks(folder.items, folder.path))
  }
  listview.replaceChildren(ul);
  
  //listview.unhighlight()
  //listview.highlight(text);
};

export function createApp() {
  folders = document.getElementById('folders');
  listview = document.querySelector('.listview');

  // Delegate click event on folders
  folders.addEventListener('click', (e) => {
    if (e.target.classList.contains('folder')) {
      handleClick(e.target);
    }
  });

  // Search box key bindings
  document.querySelector('input.search').addEventListener('keyup', (e) => {
    if (e.keyCode === 13) { // Enter
      var text = e.currentTarget.value;
      if (text !== '') {
        search(text);
      }
    }
  });

  // Close any error message on click
  document.body.addEventListener('click', () => {
    document.getElementById('error').style.display = 'none';
  });

  // Enable dropping JSON bookmark files
  if (window.File && window.FileReader) {
    new DropTarget('body', files => loadBookmarksFromFile(files));
  }

  const s = document.querySelector('script[type="application/ld+json"]');

  if (s) {
    var json = JSON.parse(s.textContent);
    loadBookmarksFromJson(json);
  }
}
