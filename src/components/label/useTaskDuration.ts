import { useEffect, useRef, useState } from "react"

const TICK_MS = 200

/**
 * Monotonic time-on-screen for the current task, resetting when `targetId`
 * changes. Uses performance.now() rather than wall-clock time so it's
 * immune to system clock adjustments during a session.
 */
export function useTaskDuration(targetId: string): number {
  const startRef = useRef(performance.now())
  const [elapsedMs, setElapsedMs] = useState(0)

  useEffect(() => {
    startRef.current = performance.now()
    setElapsedMs(0)

    const interval = setInterval(() => {
      setElapsedMs(performance.now() - startRef.current)
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [targetId])

  return elapsedMs
}
