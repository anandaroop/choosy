/**
 * Pure progress-computation logic. No I/O — shared between the queue
 * endpoint (to report progress alongside the next item) and the UI.
 */
import { Dataset, Progress } from "labeling/types"

export function computeProgress(
  dataset: Dataset,
  completedTargetIds: string[]
): Progress {
  const total = dataset.items.length
  const datasetTargetIds = new Set(dataset.items.map((item) => item.targetId))
  // Only count completions that correspond to an item still in the dataset —
  // a stale completion from a prior dataset version shouldn't inflate progress.
  const completed = completedTargetIds.filter((id) =>
    datasetTargetIds.has(id)
  ).length

  return { completed, total, remaining: total - completed }
}
