import { useRouter } from "next/router"

/**
 * Genuine OAuth failures (e.g. Gravity rejected the exchange), distinct from
 * the authorization denial handled by /no-access — signIn() always succeeds,
 * so this page should only ever be reached by a real OAuth error.
 */
export default function AuthError() {
  const router = useRouter()
  const error = router.query.error

  return (
    <div>
      <h1>Sign-in error</h1>
      <p>
        Something went wrong signing you in{error ? ` (${error})` : ""}. Please
        try again.
      </p>
    </div>
  )
}
