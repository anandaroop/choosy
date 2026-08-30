/**
 * A handful of @artsy/palette@46 components forward certain props straight
 * to the DOM instead of consuming them, which React logs as a console.error
 * — not something callers can avoid via different prop combinations
 * (confirmed via isolated repro for each): Stack always leaks flexDirection;
 * StackableBorderBox always leaks borderColor, even with no props at all;
 * TextArea always leaks its `error` default (false) as a non-boolean
 * attribute; Button with `loading` always leaks lineHeight, alignItems, and
 * justifyContent (its internal loading-spinner markup). Filtered out here
 * so tests still fail on any other unexpected console.error.
 */
const KNOWN_LEAKED_PROPS = [
  "flexDirection",
  "borderColor",
  "lineHeight",
  "alignItems",
  "justifyContent",
]

function isKnownWarning(args: unknown[]): boolean {
  if (typeof args[0] !== "string") return false

  if (
    args[0].includes("React does not recognize the `%s` prop") &&
    KNOWN_LEAKED_PROPS.some((prop) => args.includes(prop))
  ) {
    return true
  }

  if (
    args[0].includes("for a non-boolean attribute") &&
    args.includes("error")
  ) {
    return true
  }

  return false
}

export function watchConsoleErrors(): jest.SpyInstance {
  return jest.spyOn(console, "error").mockImplementation((...args) => {
    if (!isKnownWarning(args)) {
      throw new Error(`Unexpected console.error: ${args.join(" ")}`)
    }
  })
}
