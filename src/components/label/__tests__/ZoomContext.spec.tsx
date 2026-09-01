import { act, render, renderHook, screen } from "@testing-library/react"
import { Theme } from "@artsy/palette"

import { ZoomPanel } from "../ZoomPanel"
import { useZoom, useZoomSrc, ZoomProvider } from "../ZoomContext"

describe("ZoomContext", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("useZoom() outside a ZoomProvider returns stable no-op actions", () => {
    const { result } = renderHook(() => useZoom())

    expect(() => result.current.show("https://example.com/x.jpg")).not.toThrow()
    expect(() => result.current.hide()).not.toThrow()
  })

  it("useZoomSrc() outside a ZoomProvider returns null", () => {
    const { result } = renderHook(() => useZoomSrc())

    expect(result.current).toBeNull()
  })

  it("show()/hide() update what ZoomPanel renders under the same provider", () => {
    function Harness() {
      const { show, hide } = useZoom()
      return (
        <>
          <button onClick={() => show("https://example.com/x.jpg")}>
            show
          </button>
          <button onClick={() => hide()}>hide</button>
          <ZoomPanel />
        </>
      )
    }

    render(
      <Theme>
        <ZoomProvider>
          <Harness />
        </ZoomProvider>
      </Theme>
    )

    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()

    act(() => {
      screen.getByText("show").click()
    })
    expect(screen.getByTestId("image-zoom-img")).toHaveAttribute(
      "src",
      "https://example.com/x.jpg"
    )

    act(() => {
      screen.getByText("hide").click()
    })
    expect(screen.queryByTestId("image-zoom")).not.toBeInTheDocument()
  })
})
