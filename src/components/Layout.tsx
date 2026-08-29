import { useRouter } from "next/router"
import { PropsWithChildren, useEffect } from "react"

import { AccessResult } from "utils/access"

const PUBLIC_ROUTES = ["/auth/error", "/no-access"]

interface LayoutProps {
  accessResult: AccessResult
}

/**
 * Access is resolved server-side (see _app.page.tsx getInitialProps) and
 * passed down as a prop — never gated on client-side useFlag, so there's no
 * flash of denied/allowed content while a flag check resolves in the browser.
 */
export function Layout({
  accessResult,
  children,
}: PropsWithChildren<LayoutProps>) {
  const router = useRouter()
  const isPublicRoute = PUBLIC_ROUTES.includes(router.pathname)

  useEffect(() => {
    if (!isPublicRoute && !accessResult.hasAccess) {
      router.replace(`/no-access?reason=${accessResult.reason}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPublicRoute, accessResult.hasAccess, accessResult.reason])

  if (isPublicRoute) {
    return <>{children}</>
  }

  if (!accessResult.hasAccess) {
    return null
  }

  return <>{children}</>
}
