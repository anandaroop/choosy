import { unstable_getServerSession } from "next-auth"
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next"
import type { Session } from "next-auth"

import { authOptions } from "pages/api/auth/[...nextauth].page"

type ServerSessionContext =
  | { req: NextApiRequest; res: NextApiResponse }
  | {
      req: GetServerSidePropsContext["req"]
      res: GetServerSidePropsContext["res"]
    }

export async function getSessionUser(
  ctx: ServerSessionContext
): Promise<Session["user"] | null> {
  const session = await unstable_getServerSession(ctx.req, ctx.res, authOptions)
  return session?.user ?? null
}
