import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getFocusableEdges, trapTabKey } from '../../out/focus-trap.js'
import { hideElement, render, setupDom } from './setup.js'

const window = setupDom()

describe('getFocusableEdges', () => {
  it('returns the first and last focusable elements in DOM order', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <button id="first">First</button>
        <span>Not focusable</span>
        <input id="middle" />
        <a href="#" id="last">Last</a>
      </div>
    `)

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))

    assert.equal(first, document.getElementById('first'))
    assert.equal(last, document.getElementById('last'))
  })

  it('returns the same element twice when there is a single focusable child', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <button id="only">Only</button>
      </div>
    `)

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))

    assert.equal(first, document.getElementById('only'))
    assert.equal(last, document.getElementById('only'))
  })

  it('returns two nulls when there is nothing focusable', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <span>Not focusable</span>
      </div>
    `)

    assert.deepEqual(
      getFocusableEdges(document.getElementById('dialog')),
      [null, null]
    )
  })

  it('skips elements without painted dimensions', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <button id="hidden">Hidden</button>
        <button id="visible">Visible</button>
      </div>
    `)
    hideElement(document.getElementById('hidden'))

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))

    assert.equal(first, document.getElementById('visible'))
    assert.equal(last, document.getElementById('visible'))
  })

  it('skips the children of inert, hidden and disabled containers', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <div inert><button id="inert-child">Inert</button></div>
        <div hidden><button id="hidden-child">Hidden</button></div>
        <fieldset disabled><button id="disabled-child">Disabled</button></fieldset>
        <button id="visible">Visible</button>
      </div>
    `)

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))

    assert.equal(first, document.getElementById('visible'))
    assert.equal(last, document.getElementById('visible'))
  })

  it('ignores non-summary descendants of a closed details element', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <details>
          <summary id="summary">More</summary>
          <button id="details-child">Hidden</button>
        </details>
        <button id="after">After</button>
      </div>
    `)

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))

    assert.equal(first, document.getElementById('summary'))
    assert.equal(last, document.getElementById('after'))
  })

  it('collects focusable descendants of an open details element', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <details open>
          <summary id="summary">More</summary>
          <button id="details-child">Shown</button>
        </details>
      </div>
    `)

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))

    assert.equal(first, document.getElementById('summary'))
    assert.equal(last, document.getElementById('details-child'))
  })

  it('descends into shadow roots when walking the tree', () => {
    render('<div id="dialog" tabindex="-1"><div id="host"></div></div>')
    const host = document.getElementById('host')
    const shadow = host.attachShadow({ mode: 'open' })
    shadow.innerHTML = '<button id="shadow-button">Shadow</button>'

    const [first, last] = getFocusableEdges(document.getElementById('dialog'))
    const shadowButton = shadow.getElementById('shadow-button')

    assert.equal(first, shadowButton)
    assert.equal(last, shadowButton)
  })
})

describe('trapTabKey', () => {
  const tabEvent = (shiftKey = false) =>
    new window.KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey,
      cancelable: true,
    })

  it('loops forward from the last focusable element to the first', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <button id="first">First</button>
        <button id="last">Last</button>
      </div>
    `)
    const dialog = document.getElementById('dialog')
    document.getElementById('last').focus()

    const event = tabEvent()
    trapTabKey(dialog, event)

    assert.equal(document.activeElement, document.getElementById('first'))
    assert.equal(event.defaultPrevented, true)
  })

  it('loops backward from the first focusable element to the last', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <button id="first">First</button>
        <button id="last">Last</button>
      </div>
    `)
    const dialog = document.getElementById('dialog')
    document.getElementById('first').focus()

    const event = tabEvent(true)
    trapTabKey(dialog, event)

    assert.equal(document.activeElement, document.getElementById('last'))
    assert.equal(event.defaultPrevented, true)
  })

  it('leaves focus untouched when tabbing from a middle element', () => {
    render(`
      <div id="dialog" tabindex="-1">
        <button id="first">First</button>
        <button id="middle">Middle</button>
        <button id="last">Last</button>
      </div>
    `)
    const dialog = document.getElementById('dialog')
    document.getElementById('middle').focus()

    const event = tabEvent()
    trapTabKey(dialog, event)

    assert.equal(document.activeElement, document.getElementById('middle'))
    assert.equal(event.defaultPrevented, false)
  })

  it('prevents tabbing out of a dialog without focusable children', () => {
    render('<div id="dialog" tabindex="-1"><span>Nothing</span></div>')
    const dialog = document.getElementById('dialog')

    const event = tabEvent()
    trapTabKey(dialog, event)

    assert.equal(event.defaultPrevented, true)
  })
})
