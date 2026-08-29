/**
 * Pure labeling-queue logic.
 *
 * No I/O — the caller passes in the dataset and the labeler's completed
 * target ids. Safe to unit test with plain fixtures and to share between the
 * API route and its tests.
 */
import { Dataset, LabelingItem } from "labeling/types"

/**
 * The next unlabeled item for a labeler, or `null` once every item is done.
 *
 * Selection follows the dataset's own item order (not random), so a resumed
 * session always continues from the same point, and two labelers working the
 * same dataset each get the first item unlabeled *for them* — one labeler's
 * completions never skip an item for another.
 */
export function selectNextItem(
  dataset: Dataset,
  completedTargetIds: string[]
): LabelingItem | null {
  const completed = new Set(completedTargetIds)
  return dataset.items.find((item) => !completed.has(item.targetId)) ?? null
}
