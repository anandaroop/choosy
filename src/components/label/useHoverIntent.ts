import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Tracks whether the pointer has rested on an element for `delayMs`,
 * cancelling if it leaves first. `onActivate` fires once the delay elapses;
 * `onDeactivate` fires on mouseleave *and* on unmount, so a caller can always
 * treat it as "clean up whatever activate did."
 *
 * State is local to whichever component calls this — deliberately not
 * lifted to a shared/page-level owner, so it's immune to (and doesn't
 * trigger) unrelated re-renders elsewhere in the tree.
 */
export function useHoverIntent(
  delayMs: number,
  onActivate: () => void,
  onDeactivate: () => void
) {
  const [active, setActive] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Latest-callback refs: keep onActivate/onDeactivate out of the handlers'
  // dep arrays so inline arrows at the call site don't recreate them (and
  // restart pending timers) on every render.
  const onActivateRef = useRef(onActivate)
  onActivateRef.current = onActivate
  const onDeactivateRef = useRef(onDeactivate)
  onDeactivateRef.current = onDeactivate

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const onMouseEnter = useCallback(() => {
    clearPendingTimeout()
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      onActivateRef.current()
      setActive(true)
    }, delayMs)
  }, [clearPendingTimeout, delayMs])

  const onMouseLeave = useCallback(() => {
    clearPendingTimeout()
    if (active) {
      onDeactivateRef.current()
    }
    setActive(false)
  }, [active, clearPendingTimeout])

  // Unmounting mid-delay must not leave a dangling timer. React 19 no longer
  // warns on a setState call after unmount, so this cleanup is the only
  // thing actually preventing a leak — nothing else would catch it.
  useEffect(() => clearPendingTimeout, [clearPendingTimeout])

  return { active, onMouseEnter, onMouseLeave }
}
