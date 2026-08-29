import { isFlagEnabledForUser } from "lib/unleash/server"
import { Action, isPermitted } from "system"

export const LABELING_ACCESS_FLAG = "c2c_valuation-choosy-access"

export type AccessReason =
  "team-role" | "feature-flag" | "denied" | "unleash-unavailable"

export interface AccessResult {
  hasAccess: boolean
  reason: AccessReason
}

export interface AccessCheckUser {
  id: string
  roles: string[]
}

/**
 * Access is role-OR-flag: team is always in, and always short-circuits
 * before Unleash is called (so an Unleash outage never affects the team).
 * Anyone else needs an allowlist entry on LABELING_ACCESS_FLAG; if Unleash
 * can't be reached, non-team users fail closed rather than being let in.
 */
export async function checkAccess(
  user: AccessCheckUser | null
): Promise<AccessResult> {
  if (!user) {
    return { hasAccess: false, reason: "denied" }
  }

  if (isPermitted(user.roles, "labeling", Action.read)) {
    return { hasAccess: true, reason: "team-role" }
  }

  const { enabled, available } = await isFlagEnabledForUser(
    LABELING_ACCESS_FLAG,
    user.id
  )

  if (!available) {
    return { hasAccess: false, reason: "unleash-unavailable" }
  }

  if (enabled) {
    return { hasAccess: true, reason: "feature-flag" }
  }

  return { hasAccess: false, reason: "denied" }
}
