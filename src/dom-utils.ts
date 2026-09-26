/**
 * Set the focus to the first element with `autofocus` with the element or the
 * element itself.
 */
export function focus(el: HTMLElement) {
  ;(el.querySelector<HTMLElement>('[autofocus]') || el).focus()
}

/**
 * Find the closest element to the given element matching the given selector,
 * accounting for Shadow DOM subtrees.
 * @author Louis St-Amour
 * @see: https://stackoverflow.com/a/56105394
 */
export function closest(selector: string, base: Element | null) {
  function from(el: Element | Window | Document | null): Element | null {
    if (!el || el === document || el === window) return null
    // Reading the `assignedSlot` property from the element (as suggested by the
    // aforementioned StackOverflow answer) is not enough, because it does not
    // take into consideration elements nested deeply within a <slot>. For these
    // elements, the `assignedSlot` property is `null` as it is only specified
    // for top-level elements within a <slot>. To still find the closest <slot>,
    // we walk up the tree looking for the `assignedSlot` property.
    const slot = findAssignedSlot(el as Element)
    if (slot) el = slot
    return (
      (el as Element).closest(selector) ||
      from(((el as Element).getRootNode() as ShadowRoot).host)
    )
  }

  return from(base)
}

function findAssignedSlot(node: Element): Element | null {
  return (
    node.assignedSlot ||
    (node.parentNode ? findAssignedSlot(node.parentNode as Element) : null)
  )
}

// The focus-related helpers now live in `focus-trap.ts`; they are re-exported
// here so the public surface of this module remains unchanged.
export { getActiveEl, getFocusableEdges, trapTabKey } from './focus-trap.js'
