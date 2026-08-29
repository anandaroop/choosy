import { Dataset, SubmissionPayload } from "labeling/types"

import { validateSubmission } from "../validation"

function makeDataset(): Dataset {
  return {
    version: "test-v1",
    items: [
      {
        targetId: "target-1",
        target: {
          id: "lot-target-1",
          imageUrl: "https://example.com/1.jpg",
          artistName: "Artist One",
          title: "Target One",
          details: "",
        },
        candidates: [
          {
            id: "cand-a",
            imageUrl: "https://example.com/a.jpg",
            artistName: "Artist One",
            title: "Candidate A",
            details: "",
          },
          {
            id: "cand-b",
            imageUrl: "https://example.com/b.jpg",
            artistName: "Artist One",
            title: "Candidate B",
            details: "",
          },
        ],
      },
    ],
  }
}

function makeValidPayload(
  overrides: Partial<SubmissionPayload> = {}
): SubmissionPayload {
  return {
    datasetVersion: "test-v1",
    targetId: "target-1",
    ratings: [
      { candidateId: "cand-a", rating: "strong_match", note: null },
      { candidateId: "cand-b", rating: "no_match", note: null },
    ],
    durationMs: 15000,
    ...overrides,
  }
}

describe("validateSubmission", () => {
  const dataset = makeDataset()

  it("accepts a valid submission", () => {
    expect(validateSubmission(dataset, makeValidPayload())).toEqual([])
  })

  it("rejects an unknown dataset version", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({ datasetVersion: "other-v1" })
    )
    expect(errors).toEqual([
      'Unknown dataset version "other-v1" (expected "test-v1")',
    ])
  })

  it("rejects an unknown target", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({ targetId: "unknown-target" })
    )
    expect(errors).toEqual(['Unknown target "unknown-target"'])
  })

  it("rejects a candidate not in the target's list", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({
        ratings: [
          { candidateId: "cand-a", rating: "strong_match", note: null },
          { candidateId: "cand-zzz", rating: "no_match", note: null },
        ],
      })
    )
    expect(errors).toContain(
      'Candidate "cand-zzz" is not in target "target-1"\'s candidate list'
    )
    // cand-b is legitimately missing since it wasn't rated.
    expect(errors).toContain('Missing rating for candidate "cand-b"')
  })

  it("rejects a duplicate candidate rating", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({
        ratings: [
          { candidateId: "cand-a", rating: "strong_match", note: null },
          { candidateId: "cand-a", rating: "no_match", note: null },
          { candidateId: "cand-b", rating: "no_match", note: null },
        ],
      })
    )
    expect(errors).toEqual(['Duplicate rating for candidate "cand-a"'])
  })

  it("rejects a partial set with a missing candidate", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({
        ratings: [
          { candidateId: "cand-a", rating: "strong_match", note: null },
        ],
      })
    )
    expect(errors).toEqual(['Missing rating for candidate "cand-b"'])
  })

  it("rejects an illegal rating value", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({
        ratings: [
          {
            candidateId: "cand-a",
            // Intentionally invalid at the type level to simulate a bad wire payload.
            rating:
              "definitely_match" as unknown as SubmissionPayload["ratings"][number]["rating"],
            note: null,
          },
          { candidateId: "cand-b", rating: "no_match", note: null },
        ],
      })
    )
    expect(errors).toEqual([
      'Illegal rating "definitely_match" for candidate "cand-a"',
    ])
  })

  it("rejects a negative durationMs", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({ durationMs: -1 })
    )
    expect(errors).toEqual(["durationMs must not be negative (got -1)"])
  })

  it("rejects an absurdly large durationMs", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({ durationMs: 999_999_999 })
    )
    expect(errors).toEqual([
      "durationMs exceeds the maximum of 7200000 (got 999999999)",
    ])
  })

  it("rejects an over-long note", () => {
    const errors = validateSubmission(
      dataset,
      makeValidPayload({
        ratings: [
          {
            candidateId: "cand-a",
            rating: "strong_match",
            note: "x".repeat(1001),
          },
          { candidateId: "cand-b", rating: "no_match", note: null },
        ],
      })
    )
    expect(errors).toEqual([
      'Note for candidate "cand-a" exceeds 1000 characters',
    ])
  })
})
