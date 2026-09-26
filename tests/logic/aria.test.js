import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getClosestModal,
  getDialogId,
  initDialogAttributes,
  isAlertDialog,
  isDialogCloser,
  isDialogOpener,
  markDialogHidden,
  markDialogShown,
  SCOPE,
} from '../../out/aria.js'
import { render, setupDom } from './setup.js'

setupDom()

describe('getDialogId', () => {
  it('prefers the data-a11y-dialog attribute over the id', () => {
    render('<div data-a11y-dialog="from-attribute" id="from-id"></div>')

    assert.equal(getDialogId(document.body.firstElementChild), 'from-attribute')
  })

  it('falls back to the element id', () => {
    render('<div id="from-id"></div>')

    assert.equal(getDialogId(document.body.firstElementChild), 'from-id')
  })
})

describe('initDialogAttributes', () => {
  it('sets the hidden, modal, tabindex and role attributes', () => {
    render('<div id="dialog"></div>')
    const dialog = document.getElementById('dialog')

    initDialogAttributes(dialog)

    assert.equal(dialog.getAttribute('aria-hidden'), 'true')
    assert.equal(dialog.getAttribute('aria-modal'), 'true')
    assert.equal(dialog.getAttribute('tabindex'), '-1')
    assert.equal(dialog.getAttribute('role'), 'dialog')
  })

  it('preserves an author-provided role', () => {
    render('<div id="dialog" role="alertdialog"></div>')
    const dialog = document.getElementById('dialog')

    initDialogAttributes(dialog)

    assert.equal(dialog.getAttribute('role'), 'alertdialog')
  })
})

describe('markDialogShown / markDialogHidden', () => {
  it('toggles the aria-hidden attribute', () => {
    render('<div id="dialog" aria-hidden="true"></div>')
    const dialog = document.getElementById('dialog')

    markDialogShown(dialog)
    assert.equal(dialog.hasAttribute('aria-hidden'), false)

    markDialogHidden(dialog)
    assert.equal(dialog.getAttribute('aria-hidden'), 'true')
  })
})

describe('isAlertDialog', () => {
  it('detects the alertdialog role', () => {
    render(`
      <div id="alert" role="alertdialog"></div>
      <div id="plain" role="dialog"></div>
    `)

    assert.equal(isAlertDialog(document.getElementById('alert')), true)
    assert.equal(isAlertDialog(document.getElementById('plain')), false)
  })
})

describe('isDialogOpener', () => {
  it('matches the opener itself and elements nested within it', () => {
    render(`
      <button data-a11y-dialog-show="my-dialog" id="opener">
        <span id="nested">Open</span>
      </button>
      <button id="unrelated">Other</button>
    `)

    assert.equal(
      isDialogOpener(document.getElementById('opener'), 'my-dialog'),
      true
    )
    assert.equal(
      isDialogOpener(document.getElementById('nested'), 'my-dialog'),
      true
    )
    assert.equal(
      isDialogOpener(document.getElementById('unrelated'), 'my-dialog'),
      false
    )
  })

  it('does not match an opener declared for another dialog', () => {
    render('<button data-a11y-dialog-show="other-dialog" id="opener"></button>')

    assert.equal(
      isDialogOpener(document.getElementById('opener'), 'my-dialog'),
      false
    )
  })
})

describe('isDialogCloser', () => {
  it('matches an explicit closer for the dialog', () => {
    render(`
      <div id="dialog" aria-modal="true">
        <button data-a11y-dialog-hide="my-dialog" id="closer"></button>
      </div>
    `)
    const dialog = document.getElementById('dialog')

    assert.equal(
      isDialogCloser(document.getElementById('closer'), 'my-dialog', dialog),
      true
    )
  })

  it('matches a bare closer sitting inside the dialog', () => {
    render(`
      <div id="dialog" aria-modal="true">
        <button data-a11y-dialog-hide id="closer"></button>
      </div>
    `)
    const dialog = document.getElementById('dialog')

    assert.equal(
      isDialogCloser(document.getElementById('closer'), 'my-dialog', dialog),
      true
    )
  })

  it('does not match a bare closer outside the dialog', () => {
    render(`
      <div id="dialog" aria-modal="true"></div>
      <button data-a11y-dialog-hide id="closer"></button>
    `)
    const dialog = document.getElementById('dialog')

    assert.equal(
      isDialogCloser(document.getElementById('closer'), 'my-dialog', dialog),
      false
    )
  })

  it('does not match a closer declared for another dialog', () => {
    render(`
      <div id="dialog" aria-modal="true"></div>
      <button data-a11y-dialog-hide="other-dialog" id="closer"></button>
    `)
    const dialog = document.getElementById('dialog')

    assert.equal(
      isDialogCloser(document.getElementById('closer'), 'my-dialog', dialog),
      false
    )
  })
})

describe('getClosestModal', () => {
  it('returns the closest aria-modal ancestor of the target', () => {
    render(`
      <div id="modal" aria-modal="true">
        <div><button id="inside">Inside</button></div>
      </div>
      <button id="outside">Outside</button>
    `)

    assert.equal(
      getClosestModal(document.getElementById('inside')),
      document.getElementById('modal')
    )
    assert.equal(getClosestModal(document.getElementById('outside')), null)
  })
})

describe('SCOPE', () => {
  it('is the data attribute scoping dialog instances', () => {
    assert.equal(SCOPE, 'data-a11y-dialog')
  })
})
