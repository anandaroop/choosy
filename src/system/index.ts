/**
 * Trimmed from orbit's src/system/index.ts: one role, one domain — choosy
 * has no admin/service roles, and access beyond `team` is decided by the
 * Unleash flag check in utils/access.ts, not by RBAC.
 */

export enum Role {
  team = "team",
}

export enum Action {
  read = "read",
  manage = "manage",
}

export type Domain = "labeling"

export const PERMISSIONS: Record<Domain, Record<Action, Role[]>> = {
  labeling: {
    [Action.read]: [Role.team],
    [Action.manage]: [Role.team],
  },
}

export function isPermitted(
  roles: string[],
  domain: Domain,
  action: Action
): boolean {
  const allowedRoles = PERMISSIONS[domain][action]
  return roles.some((role) => allowedRoles.includes(role as Role))
}

export function assertPermitted(
  roles: string[],
  domain: Domain,
  action: Action
): void {
  if (!isPermitted(roles, domain, action)) {
    throw new Error(`Not permitted: ${domain}.${action}`)
  }
}
