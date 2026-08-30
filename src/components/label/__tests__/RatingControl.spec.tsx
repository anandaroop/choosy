import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Theme } from "@artsy/palette"

import { Rating } from "labeling/types"

import { RatingControl } from "../RatingControl"

function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

describe("RatingControl", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("renders three radios for good/neutral/bad", () => {
    renderWithTheme(<RatingControl value={null} onChange={jest.fn()} />)

    expect(screen.getByRole("radio", { name: /good/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /neutral/i })).toBeInTheDocument()
    expect(screen.getByRole("radio", { name: /bad/i })).toBeInTheDocument()
  })

  it("reflects the current value via aria-checked", () => {
    renderWithTheme(<RatingControl value="strong_match" onChange={jest.fn()} />)

    expect(screen.getByRole("radio", { name: /good/i })).toBeChecked()
    expect(screen.getByRole("radio", { name: /neutral/i })).not.toBeChecked()
    expect(screen.getByRole("radio", { name: /bad/i })).not.toBeChecked()
  })

  it("calls onChange with the right Rating when a segment is clicked", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithTheme(<RatingControl value={null} onChange={onChange} />)

    await user.click(screen.getByRole("radio", { name: /neutral/i }))
    expect(onChange).toHaveBeenCalledWith("weak_match")

    await user.click(screen.getByRole("radio", { name: /bad/i }))
    expect(onChange).toHaveBeenCalledWith("no_match")

    await user.click(screen.getByRole("radio", { name: /good/i }))
    expect(onChange).toHaveBeenCalledWith("strong_match")
  })

  it("supports 1/2/3 keyboard shortcuts on the focused row", async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()
    renderWithTheme(<RatingControl value={null} onChange={onChange} />)

    screen.getByRole("radio", { name: /good/i }).focus()

    await user.keyboard("2")
    expect(onChange).toHaveBeenCalledWith("weak_match")

    await user.keyboard("3")
    expect(onChange).toHaveBeenCalledWith("no_match")

    await user.keyboard("1")
    expect(onChange).toHaveBeenCalledWith("strong_match")
  })

  it.each<[Rating, string]>([
    ["strong_match", "good"],
    ["weak_match", "neutral"],
    ["no_match", "bad"],
  ])("marks %s as checked on the %s segment", (value, label) => {
    renderWithTheme(<RatingControl value={value} onChange={jest.fn()} />)

    expect(
      screen.getByRole("radio", { name: new RegExp(label, "i") })
    ).toBeChecked()
  })
})
