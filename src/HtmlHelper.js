/**
 * Create an HTML element.
 *
 * @param {string} name - Name of the element
 * @param {string[]} classList - List of element classes
 * @param {string} textContent - The text content of the element
 * @param {Object[]} attributes - List of element attributes
 * @returns {HTMLElement} The created HTML element
 */
export function createElement(name, classList, textContent, attributes) {
  let el = document.createElement(name);
  if (classList && classList.length > 0) {
    el.classList.add(...classList);
  }
  if (textContent) {
    el.textContent = textContent;
  }
  if (attributes && attributes.length > 0) {
    for (const a of attributes) {
      el.setAttribute(a.name, a.value);
    }
  }
  return el;
}