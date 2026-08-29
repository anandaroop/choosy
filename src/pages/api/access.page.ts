import { NextApiRequest, NextApiResponse } from "next"

import { checkAccess, AccessResult } from "utils/access"
import { getSessionUser } from "utils/auth"

/**
 * Backs _app.page.tsx's client-side transitions: getInitialProps re-runs in
 * the browser with no req/res on route changes, so access there is
 * re-resolved through this same-origin endpoint rather than ever computed
 * client-side.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccessResult>
) {
  const user = await getSessionUser({ req, res })
  const accessResult = await checkAccess(user)
  res.status(200).json(accessResult)
}
