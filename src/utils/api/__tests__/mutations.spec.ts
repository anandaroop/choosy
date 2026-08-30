import { SubmissionPayload } from "labeling/types"

import { submitTask } from "../mutations"

const originalFetch = global.fetch

afterEach(() => {
  global.fetch = originalFetch
})

function makePayload(): SubmissionPayload {
  return {
    datasetVersion: "comps-v1",
    targetId: "target-1",
    ratings: [{ candidateId: "lot-1a", rating: "strong_match", note: null }],
    durationMs: 1000,
  }
}

describe("submitTask", () => {
  it("POSTs to /api/labeling/submissions with the payload as JSON", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => ({ ok: true, submissionId: "sub-1" }),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    const payload = makePayload()
    const result = await submitTask(payload)

    expect(mockFetch).toHaveBeenCalledWith("/api/labeling/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    expect(result).toEqual({ ok: true, submissionId: "sub-1" })
  })

  it("throws with the server's error message on a non-ok response", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Illegal rating" }),
    })
    global.fetch = mockFetch as unknown as typeof fetch

    await expect(submitTask(makePayload())).rejects.toThrow("Illegal rating")
  })
})
