/**
 * Shared type contract for the Comp Retrieval labeling domain.
 *
 * This file is FROZEN after #01-1 — dataset, API, and UI work all import
 * from here so they can be built in parallel against a stable contract.
 * Mirrors orbit's `rotations/types.ts` convention.
 *
 * Convention: all dates crossing the API boundary are ISO 8601 strings
 * (what `JSON.stringify(new Date())` produces).
 */

// ---------------------------------------------------------------------------
// Dataset (static, versioned, shipped as build-time JSON)
// ---------------------------------------------------------------------------

/** An artwork lot, as either a labeling target or a retrieval candidate. */
export interface Lot {
  id: string
  imageUrl: string
  artistName: string
  title: string
  /** Free-form display text, e.g. medium/date/dimensions. */
  details: string
}

/** One labeling task: a target lot paired with its pre-retrieved candidates. */
export interface LabelingItem {
  /** Stable id for this target across dataset versions, used to track completion. */
  targetId: string
  target: Lot
  candidates: Lot[]
}

/** A versioned, static collection of labeling items shipped as build-time JSON. */
export interface Dataset {
  version: string
  items: LabelingItem[]
}

// ---------------------------------------------------------------------------
// Labeling (API request/response shapes)
// ---------------------------------------------------------------------------

/** A labeler's judgment of how well a candidate matches its target. */
export type Rating = "strong_match" | "weak_match" | "no_match"

/** One labeler's rating of a single candidate against the item's target. */
export interface CandidateRating {
  candidateId: string
  rating: Rating
  /** Optional free-text justification, shown collapsed by default in the UI. */
  note: string | null
}

/** Body of a labeling submission for one target's full set of candidates. */
export interface SubmissionPayload {
  datasetVersion: string
  targetId: string
  ratings: CandidateRating[]
  /** Wall-clock time spent on this item, in milliseconds. */
  durationMs: number
}

export interface SubmissionResponse {
  ok: true
  submissionId: string
}

/** Progress for a single labeler against a dataset. */
export interface Progress {
  completed: number
  total: number
  remaining: number
}

/** Response for GET /api/labeling/next — the next item to label, or null when done. */
export interface NextItemResponse {
  item: LabelingItem | null
  progress: Progress
  /** The active dataset's version, needed by the client to build a valid SubmissionPayload. */
  datasetVersion: string
}

// ---------------------------------------------------------------------------
// Generic API error envelope
// ---------------------------------------------------------------------------

export interface ApiError {
  error: string
}
