import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"
import { Theme } from "@artsy/palette"
import { StyleSheetManager } from "styled-components"

import { FeatureFlagProvider } from "system/featureFlags/FeatureFlagProvider"
import { shouldForwardProp } from "utils/shouldForwardProp"

export function Boot({ children }: PropsWithChildren) {
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <Theme>
        <SessionProvider>
          <FeatureFlagProvider>{children}</FeatureFlagProvider>
        </SessionProvider>
      </Theme>
    </StyleSheetManager>
  )
}
