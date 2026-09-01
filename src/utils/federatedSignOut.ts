import { signOut } from "next-auth/react"

/**
 * Gravity has no `end_session` endpoint, so signing out locally is not
 * enough — without this, the Gravity session cookie silently re-authenticates
 * the user on the next sign-in attempt.
 */
export async function federatedSignOut() {
  await signOut({ redirect: false })
  window.location.href = `${process.env.NEXT_PUBLIC_GRAVITY_URL}/api/v1/sessions/destroy?redirect_uri=${encodeURIComponent(window.location.origin)}`
}
