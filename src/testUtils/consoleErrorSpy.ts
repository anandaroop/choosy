/**
 * palette's Stack forwards its hardcoded flex-direction as a raw `flexDirection`
 * prop, which React logs as an unrecognized-DOM-attribute warning — a known
 * quirk of @artsy/palette@46, not something callers can avoid via props.
 * Filtered out here so tests still fail on any other unexpected console.error.
 */
function isKnownWarning(args: unknown[]): boolean {
  return (
    typeof args[0] === "string" &&
    args[0].includes("React does not recognize the `%s` prop") &&
    args.includes("flexDirection")
  )
}

export function watchConsoleErrors(): jest.SpyInstance {
  return jest.spyOn(console, "error").mockImplementation((...args) => {
    if (!isKnownWarning(args)) {
      throw new Error(`Unexpected console.error: ${args.join(" ")}`)
    }
  })
}
