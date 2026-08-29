import { NextApiResponse } from "next"

import { AccessCheckUser, checkAccess } from "utils/access"
import { ApiError } from "labeling/types"

export function sendError(
  res: NextApiResponse<ApiError>,
  status: number,
  error: string
): void {
  res.status(status).json({ error })
}

export function methodNotAllowed(
  res: NextApiResponse<ApiError>,
  allowed: string[]
): void {
  res.setHeader("Allow", allowed)
  sendError(res, 405, `Method not allowed. Allowed: ${allowed.join(", ")}`)
}

/**
 * Sends 401 and returns null when there's no session user; otherwise returns
 * the user for the route to continue with.
 */
export function requireUser(
  res: NextApiResponse<ApiError>,
  user: AccessCheckUser | null
): AccessCheckUser | null {
  if (!user) {
    sendError(res, 401, "Unauthorized: no active session")
    return null
  }
  return user
}

/**
 * Role-OR-flag access gate for the labeling routes. Sends 403 with a
 * denial-reason-specific message and returns false when access is denied;
 * returns true when the route should proceed.
 */
export async function requireAccess(
  res: NextApiResponse<ApiError>,
  user: AccessCheckUser
): Promise<boolean> {
  const { hasAccess, reason } = await checkAccess(user)

  if (hasAccess) {
    return true
  }

  const message =
    reason === "unleash-unavailable"
      ? "Forbidden: access check is temporarily unavailable"
      : "Forbidden: you do not have access to this feature"

  sendError(res, 403, message)
  return false
}
