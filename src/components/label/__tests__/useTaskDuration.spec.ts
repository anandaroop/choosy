import { act, renderHook } from "@testing-library/react"

import { useTaskDuration } from "../useTaskDuration"

describe("useTaskDuration", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("returns increasing values as time passes", () => {
    const { result } = renderHook(() => useTaskDuration("target-1"))

    const initial = result.current
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current).toBeGreaterThan(initial)

    const afterOneSecond = result.current
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current).toBeGreaterThan(afterOneSecond)
  })

  it("resets to ~0 when targetId changes", () => {
    const { result, rerender } = renderHook(
      ({ targetId }) => useTaskDuration(targetId),
      { initialProps: { targetId: "target-1" } }
    )

    act(() => {
      jest.advanceTimersByTime(5000)
    })
    expect(result.current).toBeGreaterThanOrEqual(5000)

    rerender({ targetId: "target-2" })
    expect(result.current).toBeLessThan(100)
  })
})
