import { render, screen } from "@testing-library/react"
import { Theme } from "@artsy/palette"

import Home from "../index.page"

describe("Home page", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("welcomes the (already-authorized, per Layout) visitor", () => {
    render(
      <Theme>
        <Home />
      </Theme>
    )

    expect(screen.getByText("Welcome to Choosy")).toBeInTheDocument()
  })
})
