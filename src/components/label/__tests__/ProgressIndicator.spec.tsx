import { render, screen } from "@testing-library/react"
import { Theme } from "@artsy/palette"

import { ProgressIndicator } from "../ProgressIndicator"

function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

describe("ProgressIndicator", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("renders the completed/remaining text", () => {
    renderWithTheme(<ProgressIndicator completed={4} total={5} />)

    expect(screen.getByText(/4.*of.*5.*rated/)).toBeInTheDocument()
  })

  it("renders one filled icon per completed target and one outlined icon per remaining target", () => {
    renderWithTheme(<ProgressIndicator completed={4} total={5} />)

    expect(screen.getAllByTestId("progress-completed")).toHaveLength(4)
    expect(screen.getAllByTestId("progress-remaining")).toHaveLength(1)
  })

  it("renders all outlined icons when nothing is completed", () => {
    renderWithTheme(<ProgressIndicator completed={0} total={3} />)

    expect(screen.queryByTestId("progress-completed")).not.toBeInTheDocument()
    expect(screen.getAllByTestId("progress-remaining")).toHaveLength(3)
  })

  it("renders all filled icons when everything is completed", () => {
    renderWithTheme(<ProgressIndicator completed={3} total={3} />)

    expect(screen.getAllByTestId("progress-completed")).toHaveLength(3)
    expect(screen.queryByTestId("progress-remaining")).not.toBeInTheDocument()
  })

  it("renders nothing in the icon row when total is 0", () => {
    renderWithTheme(<ProgressIndicator completed={0} total={0} />)

    expect(screen.queryByTestId("progress-completed")).not.toBeInTheDocument()
    expect(screen.queryByTestId("progress-remaining")).not.toBeInTheDocument()
    expect(screen.getByText(/0.*of.*0.*rated/)).toBeInTheDocument()
  })
})
