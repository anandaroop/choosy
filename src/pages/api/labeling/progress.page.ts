import { NextApiRequest, NextApiResponse } from "next"

import { getCompletedTargetIds } from "labeling/db/completedTargetIds"
import { computeProgress } from "labeling/logic/progress"
import { ApiError, Progress } from "labeling/types"
import { methodNotAllowed, requireAccess, requireUser } from "utils/api/handler"
import { getSessionUser } from "utils/auth"
import dataset from "data/loadDataset"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Progress | ApiError>
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

  res.status(200).json(computeProgress(dataset, completedTargetIds))
}
