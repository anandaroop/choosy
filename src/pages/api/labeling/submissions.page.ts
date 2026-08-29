import { NextApiRequest, NextApiResponse } from "next"

import { validateSubmission } from "labeling/logic/validation"
import { ApiError, SubmissionPayload, SubmissionResponse } from "labeling/types"
import {
  methodNotAllowed,
  requireAccess,
  requireUser,
  sendError,
} from "utils/api/handler"
import { getSessionUser } from "utils/auth"
import { db } from "lib/db"
import dataset from "data/loadDataset"

const PRISMA_UNIQUE_VIOLATION = "P2002"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SubmissionResponse | ApiError>
) {
  if (req.method !== "POST") {
    methodNotAllowed(res, ["POST"])
    return
  }

  const sessionUser = await getSessionUser({ req, res })
  const user = requireUser(res, sessionUser)
  if (!user) return

  if (!(await requireAccess(res, user))) return

  const payload = req.body as SubmissionPayload
  const errors = validateSubmission(dataset, payload)
  if (errors.length > 0) {
    sendError(res, 400, errors.join("; "))
    return
  }

  try {
    const submission = await db.submission.create({
      data: {
        labelerId: user.id,
        datasetId: payload.datasetVersion,
        targetLotId: payload.targetId,
        durationMs: payload.durationMs,
        ratings: {
          create: payload.ratings.map((r) => ({
            candidateLotId: r.candidateId,
            rating: r.rating,
            note: r.note,
          })),
        },
      },
    })

    res.status(201).json({ ok: true, submissionId: submission.id })
  } catch (error) {
    if (isPrismaUniqueViolation(error)) {
      sendError(res, 409, "You have already submitted a rating for this target")
      return
    }
    throw error
  }
}

/** Duck-typed rather than `instanceof Prisma.PrismaClientKnownRequestError` — that class isn't constructible under Next's Jest/SWC transform of the edge client build. */
function isPrismaUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === PRISMA_UNIQUE_VIOLATION
  )
}
