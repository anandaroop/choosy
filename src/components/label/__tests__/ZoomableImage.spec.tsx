import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Theme } from "@artsy/palette"

import { ZoomableImage } from "../ZoomableImage"
import { ZoomPanel } from "../ZoomPanel"
import { ZoomProvider } from "../ZoomContext"

function renderZoomable(
  props: Partial<React.ComponentProps<typeof ZoomableImage>> = {}
) {
  return render(
    <Theme>
      <ZoomProvider>
        <ZoomableImage
          src="https://example.com/candidate.jpg"
          alt="Candidate"
          width={100}
          height={100}
          {...props}
        />
        <ZoomPanel />
      </ZoomProvider>
    </Theme>
  )
}

describe("ZoomableImage", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    jest.useFakeTimers()
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
    jest.useRealTimers()
  })

  it("renders only the thumbnail initially", () => {
    renderZoomable()

    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()
  })

  it("shows the zoom, with the same src, once the hover delay elapses", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderZoomable()

    await user.hover(screen.getByAltText("Candidate"))
    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.getByTestId("image-zoom")).toBeInTheDocument()
    expect(screen.getByTestId("image-zoom-img")).toHaveAttribute(
      "src",
      "https://example.com/candidate.jpg"
    )
  })

  it("does not show the zoom before the delay elapses", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderZoomable()

    await user.hover(screen.getByAltText("Candidate"))
    act(() => {
      jest.advanceTimersByTime(399)
    })

    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()
  })

  it("cancels the zoom if the mouse leaves before the delay elapses", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderZoomable()

    const image = screen.getByAltText("Candidate")
    await user.hover(image)
    act(() => {
      jest.advanceTimersByTime(200)
    })
    await user.unhover(image)
    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()
  })

  it("hides the zoom once shown when the mouse leaves", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderZoomable()

    const image = screen.getByAltText("Candidate")
    await user.hover(image)
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(screen.getByTestId("image-zoom")).toBeInTheDocument()

    await user.unhover(image)

    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()
  })

  it("respects a custom hoverDelayMs", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    renderZoomable({ hoverDelayMs: 1000 })

    await user.hover(screen.getByAltText("Candidate"))
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(600)
    })
    expect(screen.getByTestId("image-zoom")).toBeInTheDocument()
  })

  it("clears its timer on unmount mid-delay, leaking no pending timer", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    const { unmount } = renderZoomable()

    await user.hover(screen.getByAltText("Candidate"))
    act(() => {
      jest.advanceTimersByTime(200)
    })

    unmount()

    expect(jest.getTimerCount()).toBe(0)
  })

  it("re-points the single zoom panel when a different thumbnail is hovered", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
    render(
      <Theme>
        <ZoomProvider>
          <ZoomableImage
            src="https://example.com/a.jpg"
            alt="A"
            width={100}
            height={100}
          />
          <ZoomableImage
            src="https://example.com/b.jpg"
            alt="B"
            width={100}
            height={100}
          />
          <ZoomPanel />
        </ZoomProvider>
      </Theme>
    )

    await user.hover(screen.getByAltText("A"))
    act(() => {
      jest.advanceTimersByTime(400)
    })
    expect(screen.getAllByTestId("image-zoom")).toHaveLength(1)
    expect(screen.getByTestId("image-zoom-img")).toHaveAttribute(
      "src",
      "https://example.com/a.jpg"
    )

    await user.unhover(screen.getByAltText("A"))
    await user.hover(screen.getByAltText("B"))
    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(screen.getAllByTestId("image-zoom")).toHaveLength(1)
    expect(screen.getByTestId("image-zoom-img")).toHaveAttribute(
      "src",
      "https://example.com/b.jpg"
    )
  })
})
