import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Theme } from "@artsy/palette"

import { LabelingItem, NextItemResponse } from "labeling/types"

import LabelPage from "../index.page"

const mockUseNextTask = jest.fn()
const mockMutate = jest.fn()
const mockSubmitTask = jest.fn()
const mockSendToast = jest.fn()

jest.mock("utils/hooks/useApi", () => ({
  useNextTask: () => mockUseNextTask(),
}))
jest.mock("utils/api/mutations", () => ({
  submitTask: (...args: unknown[]) => mockSubmitTask(...args),
}))
jest.mock("@artsy/palette", () => ({
  ...jest.requireActual("@artsy/palette"),
  useToasts: () => ({ sendToast: mockSendToast }),
}))

function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

function makeItem(): LabelingItem {
  return {
    targetId: "target-1",
    target: {
      id: "lot-target-1",
      imageUrl: "https://example.com/t.jpg",
      artistName: "Yayoi Kusama",
      title: "Infinity Nets",
      details: "",
    },
    candidates: [
      {
        id: "lot-1a",
        imageUrl: "https://example.com/1a.jpg",
        artistName: "Yayoi Kusama",
        title: "Candidate A",
        details: "",
      },
      {
        id: "lot-1b",
        imageUrl: "https://example.com/1b.jpg",
        artistName: "Yayoi Kusama",
        title: "Candidate B",
        details: "",
      },
    ],
  }
}

function makeResponse(
  overrides: Partial<NextItemResponse> = {}
): NextItemResponse {
  return {
    item: makeItem(),
    progress: { completed: 0, total: 3, remaining: 3 },
    datasetVersion: "comps-v1",
    ...overrides,
  }
}

describe("LabelPage", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleError = jest.spyOn(console, "error").mockImplementation()
    mockUseNextTask.mockReturnValue({
      data: makeResponse(),
      mutate: mockMutate,
    })
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("disables submit until every candidate is rated", async () => {
    const user = userEvent.setup()
    renderWithTheme(<LabelPage />)

    const submitButton = screen.getByRole("button", { name: /submit/i })
    expect(submitButton).toBeDisabled()

    const radios = screen.getAllByRole("radio", { name: /good/i })
    await user.click(radios[0])
    expect(submitButton).toBeDisabled()

    await user.click(radios[1])
    expect(submitButton).toBeEnabled()
  })

  it("submits a payload including all ratings and a numeric durationMs", async () => {
    const user = userEvent.setup()
    mockSubmitTask.mockResolvedValue({ ok: true, submissionId: "sub-1" })
    renderWithTheme(<LabelPage />)

    const radios = screen.getAllByRole("radio", { name: /good/i })
    await user.click(radios[0])
    await user.click(radios[1])
    await user.click(screen.getByRole("button", { name: /submit/i }))

    await waitFor(() => expect(mockSubmitTask).toHaveBeenCalled())
    const payload = mockSubmitTask.mock.calls[0][0]
    expect(payload.datasetVersion).toBe("comps-v1")
    expect(payload.targetId).toBe("target-1")
    expect(payload.ratings).toEqual([
      { candidateId: "lot-1a", rating: "strong_match", note: null },
      { candidateId: "lot-1b", rating: "strong_match", note: null },
    ])
    expect(typeof payload.durationMs).toBe("number")
  })

  it("calls mutate on a successful submit", async () => {
    const user = userEvent.setup()
    mockSubmitTask.mockResolvedValue({ ok: true, submissionId: "sub-1" })
    renderWithTheme(<LabelPage />)

    const radios = screen.getAllByRole("radio", { name: /good/i })
    await user.click(radios[0])
    await user.click(radios[1])
    await user.click(screen.getByRole("button", { name: /submit/i }))

    await waitFor(() => expect(mockMutate).toHaveBeenCalled())
  })

  it("shows a toast and preserves ratings state when submit fails", async () => {
    const user = userEvent.setup()
    mockSubmitTask.mockRejectedValue(new Error("Illegal rating"))
    renderWithTheme(<LabelPage />)

    const radios = screen.getAllByRole("radio", { name: /good/i })
    await user.click(radios[0])
    await user.click(radios[1])
    await user.click(screen.getByRole("button", { name: /submit/i }))

    await waitFor(() => expect(mockSendToast).toHaveBeenCalled())
    expect(mockMutate).not.toHaveBeenCalled()

    // ratings preserved: both segments still show as checked
    const stillChecked = screen.getAllByRole("radio", { name: /good/i })
    stillChecked.forEach((radio) => expect(radio).toBeChecked())
  })

  it("renders nothing while the task is loading", () => {
    mockUseNextTask.mockReturnValue({ data: undefined, mutate: mockMutate })
    const { container } = renderWithTheme(<LabelPage />)
    expect(container).toBeEmptyDOMElement()
  })

  it("shows a completion message when the queue is exhausted", () => {
    mockUseNextTask.mockReturnValue({
      data: makeResponse({ item: null }),
      mutate: mockMutate,
    })
    renderWithTheme(<LabelPage />)
    expect(screen.getByText(/all caught up/i)).toBeInTheDocument()
  })
})
