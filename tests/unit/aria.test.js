import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getDialogId,
  initDialogAttributes,
  isAlertDialog,
  markDialogHidden,
  markDialogShown,
  SCOPE,
} from '../../out/aria.js'

// Minimal DOM element stub supporting the attribute interface used by the
// aria helpers.
class FakeEl {
  constructor(id = '') {
    this.id = id
    this.attributes = new Map()
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value))
  }

  removeAttribute(name) {
    this.attributes.delete(name)
  }

  hasAttribute(name) {
    return this.attributes.has(name)
  }
}

test('getDialogId prefers the data-a11y-dialog attribute', () => {
  const el = new FakeEl('element-id')
  el.setAttribute(SCOPE, 'dialog-id')

  assert.equal(getDialogId(el), 'dialog-id')
})

test('getDialogId falls back to the element id', () => {
  const el = new FakeEl('element-id')

  assert.equal(getDialogId(el), 'element-id')
})

test('initDialogAttributes sets the hidden modal dialog attributes', () => {
  const el = new FakeEl()

  initDialogAttributes(el)

  assert.equal(el.getAttribute('aria-hidden'), 'true')
  assert.equal(el.getAttribute('aria-modal'), 'true')
  assert.equal(el.getAttribute('tabindex'), '-1')
  assert.equal(el.getAttribute('role'), 'dialog')
})

test('initDialogAttributes preserves an existing role', () => {
  const el = new FakeEl()
  el.setAttribute('role', 'alertdialog')

  initDialogAttributes(el)

  assert.equal(el.getAttribute('role'), 'alertdialog')
})

test('markDialogShown removes the aria-hidden attribute', () => {
  const el = new FakeEl()
  el.setAttribute('aria-hidden', 'true')

  markDialogShown(el)

  assert.equal(el.hasAttribute('aria-hidden'), false)
})

test('markDialogHidden sets aria-hidden to true', () => {
  const el = new FakeEl()

  markDialogHidden(el)

  assert.equal(el.getAttribute('aria-hidden'), 'true')
})

test('isAlertDialog only matches the alertdialog role', () => {
  const el = new FakeEl()

  assert.equal(isAlertDialog(el), false)

  el.setAttribute('role', 'dialog')
  assert.equal(isAlertDialog(el), false)

  el.setAttribute('role', 'alertdialog')
  assert.equal(isAlertDialog(el), true)
})
