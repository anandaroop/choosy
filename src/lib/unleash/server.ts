import { initialize, Unleash, UnleashEvents } from "unleash-client"

const READY_TIMEOUT_MS = 3_000

let instance: Unleash | undefined
let readyPromise: Promise<void> | undefined

/**
 * force's getOrInitUnleashServer pattern: one client instance per process,
 * context passed per-call (not baked into the client) so a single instance
 * can answer isFlagEnabledForUser for any userId.
 */
export function getUnleash(): Unleash | undefined {
  const unleashServerKey = process.env.UNLEASH_SERVER_KEY

  if (!unleashServerKey) {
    return undefined
  }

  if (!instance) {
    instance = initialize({
      appName: "choosy",
      url: process.env.UNLEASH_URL ?? "https://app.unleash-hosted.com/api",
      customHeaders: { Authorization: unleashServerKey },
      disableMetrics: process.env.NODE_ENV === "test",
    })

    readyPromise = new Promise<void>((resolve) => {
      instance!.once(UnleashEvents.Ready, () => resolve())
      instance!.once(UnleashEvents.Error, () => resolve())
    })
  }

  return instance
}

async function waitUntilReady(): Promise<void> {
  if (!readyPromise) return

  await Promise.race([
    readyPromise,
    new Promise<void>((resolve) => setTimeout(resolve, READY_TIMEOUT_MS)),
  ])
}

export interface FlagCheckResult {
  enabled: boolean
  /** false when Unleash is unreachable/unconfigured — distinct from "flag off". */
  available: boolean
}

export async function isFlagEnabledForUser(
  flag: string,
  userId: string
): Promise<FlagCheckResult> {
  const unleash = getUnleash()

  if (!unleash) {
    return { enabled: false, available: false }
  }

  await waitUntilReady()

  return { enabled: unleash.isEnabled(flag, { userId }), available: true }
}

/** Test-only: reset the singleton between specs. */
export function _resetForTests(): void {
  instance?.destroy()
  instance = undefined
  readyPromise = undefined
}
