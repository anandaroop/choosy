import { renderHook, waitFor } from "@testing-library/react"
import { SWRConfig } from "swr"
import { PropsWithChildren } from "react"

import { NextItemResponse, Progress } from "labeling/types"

import { useNextTask, useProgress } from "../useApi"

function wrapper({ children }: PropsWithChildren) {
  return <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
}

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

describe("useNextTask", () => {
  it("fetches /api/labeling/next and returns the parsed response", async () => {
    const body: NextItemResponse = {
      item: null,
      progress: { completed: 3, total: 3, remaining: 0 },
      datasetVersion: "comps-v1",
    }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => body,
    }) as unknown as typeof fetch

    const { result } = renderHook(() => useNextTask(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(body))
    expect(global.fetch).toHaveBeenCalledWith("/api/labeling/next")
  })
})

describe("useProgress", () => {
  it("fetches /api/labeling/progress and returns the parsed response", async () => {
    const body: Progress = { completed: 1, total: 3, remaining: 2 }
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => body,
    }) as unknown as typeof fetch

    const { result } = renderHook(() => useProgress(), { wrapper })

    await waitFor(() => expect(result.current.data).toEqual(body))
    expect(global.fetch).toHaveBeenCalledWith("/api/labeling/progress")
  })
})
