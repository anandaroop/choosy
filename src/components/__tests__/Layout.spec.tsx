import { render, screen } from "@testing-library/react"
import { useRouter } from "next/router"

import { Layout } from "../Layout"

const mockPush = jest.fn()
const mockReplace = jest.fn()

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))

const mockUseRouter = useRouter as jest.Mock

function mockRoute(pathname: string) {
  mockUseRouter.mockReturnValue({
    pathname,
    push: mockPush,
    replace: mockReplace,
  })
}

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("never renders labeling content in the DOM for a denied user", () => {
    mockRoute("/")

    render(
      <Layout accessResult={{ hasAccess: false, reason: "denied" }}>
        <div>labeling content</div>
      </Layout>
    )

    expect(screen.queryByText("labeling content")).not.toBeInTheDocument()
  })

  it("redirects a denied user to /no-access with the reason", () => {
    mockRoute("/")

    render(
      <Layout
        accessResult={{ hasAccess: false, reason: "unleash-unavailable" }}
      >
        <div>labeling content</div>
      </Layout>
    )

    expect(mockReplace).toHaveBeenCalledWith(
      "/no-access?reason=unleash-unavailable"
    )
  })

  it("renders children for an allowed user", () => {
    mockRoute("/")

    render(
      <Layout accessResult={{ hasAccess: true, reason: "team-role" }}>
        <div>labeling content</div>
      </Layout>
    )

    expect(screen.getByText("labeling content")).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })

  it("always renders public routes regardless of access", () => {
    mockRoute("/no-access")

    render(
      <Layout accessResult={{ hasAccess: false, reason: "denied" }}>
        <div>no-access page content</div>
      </Layout>
    )

    expect(screen.getByText("no-access page content")).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
