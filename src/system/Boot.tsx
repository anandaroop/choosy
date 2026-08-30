import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"
import { Theme } from "@artsy/palette"

import { FeatureFlagProvider } from "system/featureFlags/FeatureFlagProvider"

export function Boot({ children }: PropsWithChildren) {
  return (
    <Theme>
      <SessionProvider>
        <FeatureFlagProvider>{children}</FeatureFlagProvider>
      </SessionProvider>
    </Theme>
  )
}
