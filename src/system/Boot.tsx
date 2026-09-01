import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"
import { Theme, Toasts, ToastsProvider } from "@artsy/palette"
import { StyleSheetManager } from "styled-components"

import { FeatureFlagProvider } from "system/featureFlags/FeatureFlagProvider"
import { shouldForwardProp } from "utils/shouldForwardProp"

interface BootProps {
  /** Server-resolved session, so useSession() has data on first render
   * instead of refetching /api/auth/session client-side. */
  session?: Session | null
}

export function Boot({ children, session }: PropsWithChildren<BootProps>) {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <Theme>
        <SessionProvider session={session}>
          <FeatureFlagProvider>
            <ToastsProvider>
              {children}
              <Toasts />
            </ToastsProvider>
          </FeatureFlagProvider>
        </SessionProvider>
      </Theme>
    </StyleSheetManager>
  )
}
