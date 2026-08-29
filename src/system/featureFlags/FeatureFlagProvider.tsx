import { useSession } from "next-auth/react"
import { FlagProvider, useUnleashContext } from "@unleash/proxy-client-react"
import { PropsWithChildren, useEffect } from "react"

/**
 * force's FlagProvider builds its config inline and never calls
 * updateContext, so a userId that resolves asynchronously (as next-auth's
 * useSession does) never reaches Unleash — the userId-allowlist strategy
 * would silently never match. UpdateUnleashContext below is the fix.
 */
function UpdateUnleashContext({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const updateContext = useUnleashContext()

  useEffect(() => {
    if (session?.user?.id) {
      updateContext({ userId: session.user.id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  return <>{children}</>
}

export function FeatureFlagProvider({ children }: PropsWithChildren) {
  return (
    <FlagProvider
      config={{
        url:
          process.env.NEXT_PUBLIC_UNLEASH_URL ??
          "https://app.unleash-hosted.com/api/frontend",
        clientKey: process.env.NEXT_PUBLIC_UNLEASH_FRONTEND_KEY ?? "",
        appName: "choosy",
      }}
    >
      <UpdateUnleashContext>{children}</UpdateUnleashContext>
    </FlagProvider>
  )
}
