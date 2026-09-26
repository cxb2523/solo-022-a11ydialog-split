import assert from 'node:assert/strict'
import test from 'node:test'
import { getFocusableEdges, getTabTarget } from '../../out/focus-trap.js'

// Minimal DOM element stub covering exactly what the focus-trap traversal
// relies on: tree walking, visibility and focusability checks.
class FakeEl {
  constructor({ focusable = false, hidden = false, disabled = false } = {}) {
    this.focusable = focusable
    this.hidden = hidden
    this.disabled = disabled
    this.localName = 'div'
    this.shadowRoot = null
    this.children = []
    this.parent = null
  }

  append(...children) {
    for (const child of children) {
      child.parent = this
      this.children.push(child)
    }
    return this
  }

  get firstElementChild() {
    return this.children[0] ?? null
  }

  get lastElementChild() {
    return this.children[this.children.length - 1] ?? null
  }

  get nextElementSibling() {
    if (!this.parent) return null
    const index = this.parent.children.indexOf(this)
    return this.parent.children[index + 1] ?? null
  }

  get previousElementSibling() {
    if (!this.parent) return null
    const index = this.parent.children.indexOf(this)
    return this.parent.children[index - 1] ?? null
  }

  get offsetWidth() {
    return this.hidden ? 0 : 1
  }

  get offsetHeight() {
    return this.hidden ? 0 : 1
  }

  getClientRects() {
    return { length: this.hidden ? 0 : 1 }
  }

  getAttribute() {
    return null
  }

  matches(selector) {
    if (selector === ':disabled,[hidden],[inert]') return this.disabled
    if (selector.startsWith('details')) return false
    // Otherwise this is the joined focusable-selectors list
    return this.focusable
  }
}

test('getFocusableEdges returns nulls when nothing is focusable', () => {
  const root = new FakeEl().append(new FakeEl(), new FakeEl())

  assert.deepEqual(getFocusableEdges(root), [null, null])
})

test('getFocusableEdges finds the first and last focusable children', () => {
  const first = new FakeEl({ focusable: true })
  const last = new FakeEl({ focusable: true })
  const root = new FakeEl().append(first, new FakeEl(), last)

  assert.deepEqual(getFocusableEdges(root), [first, last])
})

test('getFocusableEdges walks the tree depth-first', () => {
  const nested = new FakeEl({ focusable: true })
  const last = new FakeEl({ focusable: true })
  const wrapper = new FakeEl().append(new FakeEl(), nested)
  const root = new FakeEl().append(wrapper, new FakeEl(), last)

  assert.deepEqual(getFocusableEdges(root), [nested, last])
})

test('getFocusableEdges skips hidden elements and inert subtrees', () => {
  const hidden = new FakeEl({ focusable: true, hidden: true })
  const insideInert = new FakeEl({ focusable: true })
  const inert = new FakeEl({ disabled: true }).append(insideInert)
  const only = new FakeEl({ focusable: true })
  const root = new FakeEl().append(hidden, inert, only)

  assert.deepEqual(getFocusableEdges(root), [only, only])
})

test('getFocusableEdges mirrors the single focusable element', () => {
  const only = new FakeEl({ focusable: true })
  const root = new FakeEl().append(new FakeEl(), only)

  assert.deepEqual(getFocusableEdges(root), [only, only])
})

test('getFocusableEdges considers the element itself when focusable', () => {
  const child = new FakeEl({ focusable: true })
  const root = new FakeEl({ focusable: true }).append(child)

  assert.deepEqual(getFocusableEdges(root), [root, child])
})

test('getTabTarget returns null when there is no focusable element', () => {
  assert.equal(getTabTarget(null, null, new FakeEl(), false), null)
  assert.equal(getTabTarget(null, null, new FakeEl(), true), null)
})

test('getTabTarget wraps from the last element to the first one', () => {
  const first = new FakeEl({ focusable: true })
  const last = new FakeEl({ focusable: true })

  assert.equal(getTabTarget(first, last, last, false), first)
})

test('getTabTarget wraps from the first element to the last one', () => {
  const first = new FakeEl({ focusable: true })
  const last = new FakeEl({ focusable: true })

  assert.equal(getTabTarget(first, last, first, true), last)
})

test('getTabTarget lets the focus move naturally within the dialog', () => {
  const first = new FakeEl({ focusable: true })
  const middle = new FakeEl({ focusable: true })
  const last = new FakeEl({ focusable: true })

  assert.equal(getTabTarget(first, last, middle, false), null)
  assert.equal(getTabTarget(first, last, middle, true), null)
  assert.equal(getTabTarget(first, last, first, false), null)
  assert.equal(getTabTarget(first, last, last, true), null)
})

test('getTabTarget stays on the only focusable element', () => {
  const only = new FakeEl({ focusable: true })

  assert.equal(getTabTarget(only, only, only, false), only)
  assert.equal(getTabTarget(only, only, only, true), only)
})
