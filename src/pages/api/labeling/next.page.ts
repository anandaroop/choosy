import { NextApiRequest, NextApiResponse } from "next"

import { getCompletedTargetIds } from "labeling/db/completedTargetIds"
import { computeProgress } from "labeling/logic/progress"
import { selectNextItem } from "labeling/logic/queue"
import { ApiError, NextItemResponse } from "labeling/types"
import {
  methodNotAllowed,
  requireAccess,
  requireUser,
  sendError,
} from "utils/api/handler"
import { getSessionUser } from "utils/auth"
import dataset from "data/loadDataset"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NextItemResponse | ApiError>
) {
  if (req.method !== "GET") {
    methodNotAllowed(res, ["GET"])
    return
  }

  const sessionUser = await getSessionUser({ req, res })
  const user = requireUser(res, sessionUser)
  if (!user) return

  if (!(await requireAccess(res, user))) return

  const completedTargetIds = await getCompletedTargetIds(
    user.id,
    dataset.version
  )
  const progress = computeProgress(dataset, completedTargetIds)

  const { targetId } = req.query
  if (typeof targetId === "string") {
    if (completedTargetIds.includes(targetId)) {
      sendError(res, 409, `Target "${targetId}" was already submitted`)
      return
    }

    const item = dataset.items.find((i) => i.targetId === targetId) ?? null
    res.status(200).json({ item, progress, datasetVersion: dataset.version })
    return
  }

  const item = selectNextItem(dataset, completedTargetIds)
  res.status(200).json({ item, progress, datasetVersion: dataset.version })
}
