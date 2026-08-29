/**
 * Dataset integrity checks. No I/O — run against a `Dataset` already parsed
 * from JSON, so a malformed fixture or future dataset build fails loudly
 * instead of silently skewing labels.
 */
import { Dataset } from "labeling/types"

export class DatasetIntegrityError extends Error {}

/**
 * Throws a `DatasetIntegrityError` describing every problem found, or
 * returns void when the dataset is structurally sound: unique lot ids
 * (across targets and candidates), at least one candidate per target, no
 * target appearing in its own candidate list, and no duplicate candidate
 * within a single target.
 */
export function assertDatasetValid(dataset: Dataset): void {
  const errors: string[] = []
  const seenLotIds = new Set<string>()

  for (const item of dataset.items) {
    const { targetId, target, candidates } = item

    if (seenLotIds.has(target.id)) {
      errors.push(`Duplicate lot id "${target.id}" (target "${targetId}")`)
    }
    seenLotIds.add(target.id)

    if (candidates.length === 0) {
      errors.push(`Target "${targetId}" has no candidates`)
    }

    const seenCandidateIdsForTarget = new Set<string>()
    for (const candidate of candidates) {
      if (candidate.id === target.id) {
        errors.push(
          `Target "${targetId}" lists itself as its own candidate ("${candidate.id}")`
        )
      }

      if (seenCandidateIdsForTarget.has(candidate.id)) {
        errors.push(
          `Duplicate candidate "${candidate.id}" within target "${targetId}"`
        )
      }
      seenCandidateIdsForTarget.add(candidate.id)

      if (seenLotIds.has(candidate.id) && candidate.id !== target.id) {
        errors.push(
          `Duplicate lot id "${candidate.id}" (candidate of target "${targetId}")`
        )
      }
      seenLotIds.add(candidate.id)
    }
  }

  if (errors.length > 0) {
    throw new DatasetIntegrityError(
      `Dataset "${dataset.version}" failed integrity checks:\n` +
        errors.map((e) => `  - ${e}`).join("\n")
    )
  }
}
