import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"
import {
  Theme,
  Toasts,
  ToastsProvider,
  injectGlobalStyles,
} from "@artsy/palette"
import { StyleSheetManager } from "styled-components"

import { FeatureFlagProvider } from "system/featureFlags/FeatureFlagProvider"
import { shouldForwardProp } from "utils/shouldForwardProp"

// Zeroes body margin/padding among other resets (see palette's
// injectGlobalStyles) — without this, the browser's default body margin
// left a visible gap around GlobalNav instead of it sitting flush with the
// viewport edges.
const { GlobalStyles } = injectGlobalStyles(``)

interface BootProps {
  /** Server-resolved session, so useSession() has data on first render
   * instead of refetching /api/auth/session client-side. */
  session?: Session | null
}

export function Boot({ children, session }: PropsWithChildren<BootProps>) {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <Theme>
        <GlobalStyles />
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
