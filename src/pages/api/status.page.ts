import { NextApiRequest, NextApiResponse } from "next"

/**
 * Kubernetes readiness probe target. Unauthenticated by design — must never
 * end up behind the access gate.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: "OK" })
}
