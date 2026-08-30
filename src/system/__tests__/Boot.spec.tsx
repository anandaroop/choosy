import { render } from "@testing-library/react"
import { useSession } from "next-auth/react"
import { Box } from "@artsy/palette"

import { Boot } from "../Boot"

jest.mock("@unleash/proxy-client-react", () => ({
  FlagProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useUnleashContext: () => jest.fn(),
}))

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}))

const mockUseSession = useSession as jest.Mock

describe("Boot", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({ data: null })
  })

  it("resolves palette color tokens, proving the theme context is wired", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation()
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation()

    render(
      <Boot>
        <Box bg="mono100" p={1}>
          content
        </Box>
      </Boot>
    )

    // Without a Theme provider, styled-system can't resolve a color token
    // like "mono100" against the theme's color scale, and the generated CSS
    // rule keeps the literal token string instead of its hex value — this
    // only ever resolves to a real color with the theme wired up. Testing
    // Library has no query for styled-components' injected <style> tags, so
    // direct node access is unavoidable here.
    // eslint-disable-next-line testing-library/no-node-access
    const styleTagContent = Array.from(document.querySelectorAll("style"))
      .map((tag) => tag.textContent)
      .join("\n")
    expect(styleTagContent).toContain("#000000")

    expect(consoleError).not.toHaveBeenCalled()
    expect(consoleWarn).not.toHaveBeenCalled()

    consoleError.mockRestore()
    consoleWarn.mockRestore()
  })
})
