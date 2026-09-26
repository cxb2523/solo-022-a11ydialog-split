import { JSDOM } from 'jsdom'

/**
 * Create a jsdom-backed DOM environment for the pure-logic tests, wiring the
 * globals the compiled modules rely on (`document`, `window`) and giving
 * every element painted dimensions, since jsdom does not do layout.
 */
export function setupDom() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
  const { window } = dom

  globalThis.window = window
  globalThis.document = window.document

  for (const prop of ['offsetWidth', 'offsetHeight']) {
    Object.defineProperty(window.HTMLElement.prototype, prop, {
      configurable: true,
      get() {
        return 100
      },
    })
  }

  return window
}

/**
 * Replace the document body with the given HTML and return the body.
 */
export function render(html) {
  document.body.innerHTML = html
  return document.body
}

/**
 * Give an element zero painted dimensions to simulate it being hidden.
 */
export function hideElement(el) {
  for (const prop of ['offsetWidth', 'offsetHeight']) {
    Object.defineProperty(el, prop, { configurable: true, value: 0 })
  }
}
