# Handoff: Orbit auth as a blueprint for a new internal/external tool

## Goal

Use artsy/orbit's authentication pattern as a starting point for a new app that supports
a different set of roles than orbit's, and (unlike orbit) allows access without requiring
any role at all — i.e. a genuine external/anonymous path.

## Source repos

- artsy/orbit — Next.js/Prisma app, HEAD `79202fa` at time of investigation
- artsy/forque — Next.js/Relay app, HEAD `87679b5` at time of investigation (orbit's likely
  model — see below)

## How orbit's auth works today

- **Mechanism**: OAuth against Artsy's Gravity backend, wired through next-auth v4. Custom
  `"artsy"` OAuth provider in `src/pages/api/auth/[...nextauth].page.ts`:
  - `authorization`: `${GRAVITY_URL}/oauth2/authorize`
  - token endpoint: `${GRAVITY_URL}/oauth2/access_token?on_success=200`
  - userinfo: fetched from `${GRAVITY_URL}/api/v1/me`, using a Gravity-specific
    `X-Access-Token` header instead of a normal `Authorization: Bearer`
  - `profile()` maps Gravity's `roles` array onto the next-auth user
  - Session is next-auth's default JWT-encoded cookie session
  - Federated sign-out (`src/utils/federatedSignOut.ts`) clears the local session AND
    redirects through Gravity's `/api/v1/sessions/destroy`, since Gravity has no
    `end_session` endpoint

- **Roles / permissions**: custom RBAC module in `src/system/index.ts`, no Pundit/CanCanCan/
  gem — just TypeScript:
  - `enum Role { team, product_development, service }` — **no `admin` role exists**
  - `enum Action { read, manage }`
  - `PERMISSIONS: Record<Domain, Record<Action, Role[]>>` — flat map, every domain grants
    `read` to `[team, service]`, `manage` to `[team]` only
  - `isPermitted()` / `assertPermitted()` intersect a user's roles against a domain/action's
    allowed roles
  - Enforcement is **per-route**, not global middleware — no `middleware.ts` for auth exists.
    `src/utils/api/handler.ts` provides `requireUser()` (401 if no session/service token) and
    `requirePermission()` (403 if role not permitted), called explicitly from each API route,
    e.g. `src/pages/api/rotations/index.page.ts`

- **Sign-in gate**: the next-auth `signIn` callback in `[...nextauth].page.ts` hard-rejects
  any account without Gravity's `team` role, before the app is ever reached — redirects to
  `/auth/error?error=AccessDenied`. There is no guest/anonymous session type.

- **Machine/service path**: `src/utils/serviceAuth.ts` checks `Authorization: Bearer <token>`
  against a comma-separated allowlist in `ORBIT_SERVICE_TOKENS`, granting a synthetic
  read-only `service` role. This is a shared-secret check, not OAuth/JWT — built for machine
  clients (e.g. a Slack bot), not general external human users.

- **UI gating**: `src/components/Layout.tsx` renders every page behind an authorized-session
  check except `/auth/error`. Signed-out visitors get a generic "please sign in" screen, never
  app content. The only unauthenticated route in the whole app is the trivial health check
  `src/pages/api/status.page.ts`.

### Bottom line on orbit as-is

Works for internal `team` users (and the `service` machine principal), but **rejects anyone
without a recognized role at the OAuth sign-in step** — there's no external/anonymous path
today. `docs/getting-started.md` documents how an operator could swap in a different
OAuth/OIDC provider or synthesize different role claims, which is basically the recipe below.

## Is orbit modeled on forque?

Yes — strong evidence this is a trimmed-down adaptation, not independent code:

- Identical file paths: `src/pages/api/auth/[...nextauth].page.ts`, `src/system/index.ts`
- Near-identical Gravity OAuth provider config, including the same non-standard
  `X-Access-Token` header override on `/api/v1/me` and the same env var names
  (`GRAVITY_URL`, `CLIENT_APPLICATION_ID`, `CLIENT_APPLICATION_SECRET`)
- Identical RBAC function/type names: `Role`, `PERMISSIONS`, `isPermitted`, `assertPermitted`
- Identical sign-in-gate mechanism (reject in the next-auth `signIn` callback based on
  Gravity's `roles` claim)
- Orbit's own `docs/architecture.md` states it "mirrors Artsy's forque internal-tools stack"

Where forque differs (useful context, since forque is the richer/older version of this
pattern):

- 9 roles (`customer_support`, `metadata_admin`, `team`, `content_manager`,
  `verification_admin`, `role_manager`, `sales_admin`, `sales_observer`, `partner_support`)
  and a ~25-domain `PERMISSIONS` table, vs. orbit's 3 roles / small domain set. Note: forque's
  `Role` enum has a comment "do not add Admin, it's to be deprecated" — `admin` is explicitly
  not part of this role model in either app.
- Forque's sign-in gate is looser: admits anyone holding **any one** of its 9 roles, not one
  specific privileged role
- Forque has no centralized `requireUser`/`requirePermission` helper — every page/route
  repeats `getSession` + `isPermitted` inline
- Forque has no service-token/machine-auth path — that's an orbit-only addition

## Recipe for a new app: different roles, and a true no-role/external path

The auth stack is ordinary app code, not framework magic, so the pattern transplants cleanly.
To adapt it:

1. **Role model**: define your own `enum Role { ... }` in place of orbit's — whatever set
   fits the new app (can include a role for external users, e.g. `external` or `guest`, or
   omit roles from that path entirely).
2. **Permissions**: adjust the `PERMISSIONS`-style map to grant `read`/`manage` (or your own
   `Action` set) to whichever roles you want, including granting something to an
   unauthenticated/roleless caller if you want a public read path.
3. **Sign-in gate**: loosen or remove the hard role check in the `signIn` callback. Orbit's
   version requires `Role.team` specifically; forque's requires any-of-N; a "no role required"
   app should let `signIn` succeed unconditionally and rely on `PERMISSIONS` (not the gate) to
   decide what a roleless user can do.
4. **UI allowlist**: orbit's `Layout.tsx` currently treats "no session" as "show sign-in
   screen" for literally every page except `/auth/error`. A real external/anonymous
   experience needs public routes added to that allowlist — this is a separate change from
   the role/permission logic, easy to miss.
5. Optional: keep or drop the service-token pattern (`serviceAuth.ts`) depending on whether
   the new app needs a machine-client path.

`docs/getting-started.md:93-148` in orbit already sketches swapping in a different OAuth/OIDC
provider and synthesizing different role claims — a reasonable starting reference for step 1.

## Open question for whoever picks this up

Confirm whether the new app should proxy through Gravity OAuth like orbit/forque (keeping
Artsy identity as the source of truth) or use an entirely different IdP — that decision
shapes how much of `[...nextauth].page.ts` can be reused vs. rewritten.
