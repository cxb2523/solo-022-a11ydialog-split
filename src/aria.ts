import { closest, getActiveEl } from './dom-utils.js'

/**
 * Name of the data attribute scoping a dialog instance and its triggers.
 */
export const SCOPE = 'data-a11y-dialog'

/**
 * Get the identifier of a dialog element: the value of its
 * `data-a11y-dialog` attribute if any, or its `id` otherwise.
 */
export function getDialogId(el: HTMLElement): string {
  return el.getAttribute(SCOPE) || el.id
}

/**
 * Initialise a dialog element with the attributes it needs: hidden by
 * default, modal, programmatically focusable, and with an implicit
 * `role="dialog"` unless the author provided a role already.
 */
export function initDialogAttributes(el: HTMLElement): void {
  el.setAttribute('aria-hidden', 'true')
  el.setAttribute('aria-modal', 'true')
  el.setAttribute('tabindex', '-1')

  if (!el.hasAttribute('role')) {
    el.setAttribute('role', 'dialog')
  }
}

/**
 * Mark the dialog element as shown.
 */
export function markDialogShown(el: HTMLElement): void {
  el.removeAttribute('aria-hidden')
}

/**
 * Mark the dialog element as hidden.
 */
export function markDialogHidden(el: HTMLElement): void {
  el.setAttribute('aria-hidden', 'true')
}

/**
 * Whether the dialog element has `role="alertdialog"`, in which case it
 * should not be dismissable with the ESC key.
 */
export function isAlertDialog(el: HTMLElement): boolean {
  return el.getAttribute('role') === 'alertdialog'
}

/**
 * Whether the given target is (or is nested within) an opener for the dialog
 * with the given identifier. Openers are declared with
 * `[data-a11y-dialog-show="<id>"]`.
 */
export function isDialogOpener(target: HTMLElement, id: string): boolean {
  // We use `closest(..)` (instead of `matches(..)`) so that clicking an
  // element nested within a dialog opener does cause the dialog to open, and
  // we use our custom `closest(..)` function so that it can cross shadow
  // boundaries
  // See: https://github.com/KittyGiraudel/a11y-dialog/issues/712
  return !!closest(`[${SCOPE}-show="${id}"]`, target)
}

/**
 * Whether the given target should close the given dialog element: either it
 * is (or is nested within) an explicit closer for this dialog
 * (`[data-a11y-dialog-hide="<id>"]`), or it matches a bare
 * `[data-a11y-dialog-hide]` sitting inside this dialog.
 */
export function isDialogCloser(
  target: HTMLElement,
  id: string,
  dialog: HTMLElement
): boolean {
  const explicitCloser = !!closest(`[${SCOPE}-hide="${id}"]`, target)
  const implicitCloser =
    !!closest(`[${SCOPE}-hide]`, target) &&
    closest('[aria-modal="true"]', target) === dialog

  return explicitCloser || implicitCloser
}

/**
 * Get the closest modal dialog (accounting for Shadow DOM subtrees) for the
 * given element, defaulting to the currently focused element.
 */
export function getClosestModal(
  target: Element | null = getActiveEl()
): Element | null {
  return closest('[aria-modal="true"]', target)
}
