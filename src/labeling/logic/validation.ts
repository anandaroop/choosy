/**
 * Pure submission validation. No I/O — structural checks against the
 * dataset that must run identically in the API route and its tests, before
 * a submission ever touches the database.
 */
import { Dataset, Rating, SubmissionPayload } from "labeling/types"

const VALID_RATINGS: Rating[] = ["strong_match", "weak_match", "no_match"]

/** Absurdly long task durations (>2h) indicate a client bug, not real focus time. */
const MAX_DURATION_MS = 2 * 60 * 60 * 1000

const MAX_NOTE_LENGTH = 1000

/**
 * Validates a submission's structure against the dataset it claims to be
 * for. Returns a list of human-readable errors; an empty list means the
 * submission is valid.
 */
export function validateSubmission(
  dataset: Dataset,
  payload: SubmissionPayload
): string[] {
  const errors: string[] = []

  if (payload.datasetVersion !== dataset.version) {
    errors.push(
      `Unknown dataset version "${payload.datasetVersion}" (expected "${dataset.version}")`
    )
    return errors
  }

  const item = dataset.items.find((i) => i.targetId === payload.targetId)
  if (!item) {
    errors.push(`Unknown target "${payload.targetId}"`)
    return errors
  }

  const validCandidateIds = new Set(item.candidates.map((c) => c.id))
  const seenCandidateIds = new Set<string>()

  for (const rating of payload.ratings) {
    if (!validCandidateIds.has(rating.candidateId)) {
      errors.push(
        `Candidate "${rating.candidateId}" is not in target "${payload.targetId}"'s candidate list`
      )
      continue
    }

    if (seenCandidateIds.has(rating.candidateId)) {
      errors.push(`Duplicate rating for candidate "${rating.candidateId}"`)
      continue
    }
    seenCandidateIds.add(rating.candidateId)

    if (!VALID_RATINGS.includes(rating.rating)) {
      errors.push(
        `Illegal rating "${rating.rating}" for candidate "${rating.candidateId}"`
      )
    }

    if (rating.note !== null && rating.note.length > MAX_NOTE_LENGTH) {
      errors.push(
        `Note for candidate "${rating.candidateId}" exceeds ${MAX_NOTE_LENGTH} characters`
      )
    }
  }

  const missingCandidateIds = [...validCandidateIds].filter(
    (id) => !seenCandidateIds.has(id)
  )
  for (const id of missingCandidateIds) {
    errors.push(`Missing rating for candidate "${id}"`)
  }

  if (payload.durationMs < 0) {
    errors.push(`durationMs must not be negative (got ${payload.durationMs})`)
  } else if (payload.durationMs > MAX_DURATION_MS) {
    errors.push(
      `durationMs exceeds the maximum of ${MAX_DURATION_MS} (got ${payload.durationMs})`
    )
  }

  return errors
}
