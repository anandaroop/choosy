import { db } from "lib/db"

/**
 * A labeler's completed target ids for a dataset — the overlap/resumability
 * query. Scoped to {labelerId, datasetId} only: which candidates a target
 * has, or what dataset version was submitted against, is irrelevant here.
 */
export async function getCompletedTargetIds(
  labelerId: string,
  datasetId: string
): Promise<string[]> {
  const submissions = await db.submission.findMany({
    where: { labelerId, datasetId },
    select: { targetLotId: true },
  })
  return submissions.map((s) => s.targetLotId)
}
