import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Theme } from "@artsy/palette"

import { Lot } from "labeling/types"

import { CandidateRow } from "../CandidateRow"

function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

function makeCandidate(overrides: Partial<Lot> = {}): Lot {
  return {
    id: "lot-1a",
    imageUrl: "https://example.com/1a.jpg",
    artistName: "Yayoi Kusama",
    title: "Infinity Nets (OTMHL)",
    details: "Acrylic on canvas, 2009, 45.5 x 38 cm",
    ...overrides,
  }
}

describe("CandidateRow", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("renders the candidate's thumbnail and metadata", () => {
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={jest.fn()}
        onNoteChange={jest.fn()}
      />
    )

    expect(screen.getByText("Yayoi Kusama")).toBeInTheDocument()
    expect(screen.getByText("Infinity Nets (OTMHL)")).toBeInTheDocument()
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      expect.stringContaining("1a")
    )
  })

  it("hides the note field by default", () => {
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={jest.fn()}
        onNoteChange={jest.fn()}
      />
    )

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("expands the note field on clicking 'Add note'", async () => {
    const user = userEvent.setup()
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={jest.fn()}
        onNoteChange={jest.fn()}
      />
    )

    await user.click(screen.getByText(/add note/i))

    expect(screen.getByRole("textbox")).toBeInTheDocument()
  })

  it("shows the note field already expanded when a note is present", () => {
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note="already has a note"
        onRatingChange={jest.fn()}
        onNoteChange={jest.fn()}
      />
    )

    expect(screen.getByRole("textbox")).toHaveValue("already has a note")
  })

  it("flows the note value into onNoteChange", async () => {
    const user = userEvent.setup()
    const onNoteChange = jest.fn()
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={jest.fn()}
        onNoteChange={onNoteChange}
      />
    )

    await user.click(screen.getByText(/add note/i))
    await user.type(screen.getByRole("textbox"), "x")

    expect(onNoteChange).toHaveBeenCalledWith("x")
  })

  it("renders the RatingControl and flows changes into onRatingChange", async () => {
    const user = userEvent.setup()
    const onRatingChange = jest.fn()
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={onRatingChange}
        onNoteChange={jest.fn()}
      />
    )

    await user.click(screen.getByRole("radio", { name: /good/i }))
    expect(onRatingChange).toHaveBeenCalledWith("strong_match")
  })

  it("calls onEscapeFromNote when Escape is pressed in the note, without recording a rating", async () => {
    const user = userEvent.setup()
    const onEscapeFromNote = jest.fn()
    const onRatingChange = jest.fn()
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={onRatingChange}
        onNoteChange={jest.fn()}
        onEscapeFromNote={onEscapeFromNote}
      />
    )

    await user.click(screen.getByText(/add note/i))
    await user.type(screen.getByRole("textbox"), "1{Escape}")

    expect(onEscapeFromNote).toHaveBeenCalledTimes(1)
    expect(onRatingChange).not.toHaveBeenCalled()
  })

  it("types digits literally in the note instead of triggering a rating", async () => {
    const user = userEvent.setup()
    const onRatingChange = jest.fn()
    renderWithTheme(
      <CandidateRow
        candidate={makeCandidate()}
        rating={null}
        note={null}
        onRatingChange={onRatingChange}
        onNoteChange={jest.fn()}
      />
    )

    await user.click(screen.getByText(/add note/i))
    await user.type(screen.getByRole("textbox"), "123")

    expect(onRatingChange).not.toHaveBeenCalled()
  })
})
