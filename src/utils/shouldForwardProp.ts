import isPropValid from "@emotion/is-prop-valid"

/**
 * Styled Components v6 removed the automatic prop filtering v5 had, so every
 * styled-system prop (bg, gap, flexDirection, borderColor, etc.) now leaks
 * straight through to the DOM as an invalid HTML attribute unless something
 * filters it — loudly flagged by React 19's stricter unknown-attribute
 * warnings. This restores the v5 behavior via the shouldForwardProp fallback
 * Styled Components' own migration guide recommends for prop-based styling
 * libraries like palette. Mirrors force's Boot.tsx and forque#2148.
 */
export const shouldForwardProp = (
  propName: string,
  target: unknown
): boolean => {
  if (typeof target === "string") {
    return isPropValid(propName)
  }
  return true
}
