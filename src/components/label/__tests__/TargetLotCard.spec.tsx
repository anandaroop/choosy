import { render, screen } from "@testing-library/react"
import { Theme } from "@artsy/palette"

import { Lot } from "labeling/types"
import { watchConsoleErrors } from "testUtils/consoleErrorSpy"

import { TargetLotCard } from "../TargetLotCard"

function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

function makeLot(overrides: Partial<Lot> = {}): Lot {
  return {
    id: "lot-1",
    imageUrl: "https://example.com/lot-1.jpg",
    artistName: "Yayoi Kusama",
    title: "Infinity Nets (TWAOA)",
    details: "Acrylic on canvas, 2007, 45.5 x 38 cm",
    ...overrides,
  }
}

describe("TargetLotCard", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = watchConsoleErrors()
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it("renders all target fields from a fixture Lot", () => {
    renderWithTheme(<TargetLotCard target={makeLot()} />)

    expect(screen.getByText("Yayoi Kusama")).toBeInTheDocument()
    expect(screen.getByText("Infinity Nets (TWAOA)")).toBeInTheDocument()
    expect(
      screen.getByText("Acrylic on canvas, 2007, 45.5 x 38 cm")
    ).toBeInTheDocument()
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("lot-1")
    )
  })

  it("renders gracefully with an empty details field", () => {
    renderWithTheme(<TargetLotCard target={makeLot({ details: "" })} />)

    expect(screen.getByText("Yayoi Kusama")).toBeInTheDocument()
    expect(screen.getByText("Infinity Nets (TWAOA)")).toBeInTheDocument()
  })
})
