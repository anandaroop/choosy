import useSWR, { SWRResponse } from "swr"

import { NextItemResponse, Progress } from "labeling/types"

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return response.json()
}

export function useNextTask(): SWRResponse<NextItemResponse> {
  return useSWR<NextItemResponse>("/api/labeling/next", fetcher)
}

export function useProgress(): SWRResponse<Progress> {
  return useSWR<Progress>("/api/labeling/progress", fetcher)
}
