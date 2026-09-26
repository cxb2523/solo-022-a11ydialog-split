/**
 * Name of the data attribute scoping a dialog instance and its triggers.
 */
export const SCOPE = 'data-a11y-dialog'

/**
 * Get the identifier of a dialog element: the value of its
 * `data-a11y-dialog` attribute if present, or its `id` otherwise.
 */
export function getDialogId(el: HTMLElement) {
  return el.getAttribute(SCOPE) || el.id
}

/**
 * Set the initial attributes of a dialog element: it starts hidden, behaves
 * as a modal, can receive focus programmatically, and gets the `dialog` role
 * unless one is already set (e.g. `alertdialog`).
 */
export function initDialogAttributes(el: HTMLElement) {
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('aria-modal', 'true')
  el.setAttribute('tabindex', '-1')

  if (!el.hasAttribute('role')) {
    el.setAttribute('role', 'dialog')
  }
}

/**
 * Mark a dialog element as shown by removing its `aria-hidden` attribute.
 */
export function markDialogShown(el: HTMLElement) {
  el.removeAttribute('aria-hidden')
}

/**
 * Mark a dialog element as hidden by setting `aria-hidden="true"` on it.
 */
export function markDialogHidden(el: HTMLElement) {
  el.setAttribute('aria-hidden', 'true')
}

/**
 * Determine whether a dialog element has the `alertdialog` role, in which
 * case it should not be dismissable with the ESC key.
 */
export function isAlertDialog(el: HTMLElement) {
  return el.getAttribute('role') === 'alertdialog'
}
