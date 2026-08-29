import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"

import { FeatureFlagProvider } from "system/featureFlags/FeatureFlagProvider"

export function Boot({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <FeatureFlagProvider>{children}</FeatureFlagProvider>
    </SessionProvider>
  )
}
