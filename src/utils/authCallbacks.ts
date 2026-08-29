import type { Profile, Session } from "next-auth"
import type { JWT } from "next-auth/jwt"

type ArtsyProfile = Profile & { roles?: string[] }

/**
 * Split out from `[...nextauth].page.ts` so these can be unit-tested without
 * loading the `next-auth` runtime (which drags in `openid-client`/`jose` —
 * packages that don't run under Jest's jsdom environment).
 */

export async function signIn(): Promise<boolean> {
  // Deliberate divergence from orbit/forque: no role check at sign-in.
  // Authorization is a separate decision — see utils/access.ts.
  return true
}

export async function jwt({
  token,
  profile,
}: {
  token: JWT
  profile?: ArtsyProfile
}): Promise<JWT> {
  if (profile) {
    token.roles = profile.roles ?? []
  }
  return token
}

export async function session({
  session,
  token,
}: {
  session: Session
  token: JWT
}): Promise<Session> {
  if (session.user) {
    session.user.id = token.sub as string
    session.user.roles = token.roles ?? []
  }
  return session
}
