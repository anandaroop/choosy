import { Session } from "next-auth"
import { signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { PropsWithChildren, useEffect } from "react"
import { Box, Button, Text } from "@artsy/palette"

import { GlobalNav } from "components/GlobalNav"
import { AccessResult } from "utils/access"

const PUBLIC_ROUTES = ["/auth/error", "/no-access"]

interface LayoutProps {
  accessResult: AccessResult
  user?: Session["user"]
}

/**
 * Access is resolved server-side (see _app.page.tsx getInitialProps) and
 * passed down as a prop — never gated on client-side useFlag, so there's no
 * flash of denied/allowed content while a flag check resolves in the browser.
 *
 * Three states below the nav, in order: a public route always renders as-is;
 * a signed-out user (on any other route) sees the nav without links/email
 * plus a sign-in prompt, and is never redirected to /no-access — that page's
 * "you're signed in, but..." copy is for the next state, a signed-in user
 * who fails the role/flag check, which keeps the existing redirect
 * untouched; anyone else renders the full nav and the page itself.
 */
export function Layout({
  accessResult,
  user,
  children,
}: PropsWithChildren<LayoutProps>) {
  const router = useRouter()
  const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname)

  useEffect(() => {
    if (!isPublicRoute && user && !accessResult.hasAccess) {
      router.replace(`/no-access?reason=${accessResult.reason}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublicRoute, user, accessResult.hasAccess, accessResult.reason])

  if (isPublicRoute) {
    return <>{children}</>
  }

  if (!user) {
    return (
      <>
        <GlobalNav />
        <Box textAlign="center" py={4}>
          <Text my={4}>Please sign in to continue.</Text>
          <Button onClick={() => signIn("artsy")}>Continue with Artsy</Button>
        </Box>
      </>
    )
  }

  if (!accessResult.hasAccess) {
    return null
  }

  return (
    <>
      <GlobalNav user={user} />
      {children}
    </>
  )
}
