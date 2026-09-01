import { render, screen } from "@testing-library/react"
import { useRouter } from "next/router"
import { Theme } from "@artsy/palette"
import { Session } from "next-auth"

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

function renderWithTheme(ui: React.ReactElement) {
  return render(<Theme>{ui}</Theme>)
}

const user: Session["user"] = {
  id: "user-1",
  roles: ["team"],
  name: "Roop",
  email: "roop@artsymail.com",
}

describe("Layout", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("signed in", () => {
    it("never renders labeling content in the DOM for a denied user", () => {
      mockRoute("/")

      renderWithTheme(
        <Layout
          accessResult={{ hasAccess: false, reason: "denied" }}
          user={user}
        >
          <div>labeling content</div>
        </Layout>
      )

      expect(screen.queryByText("labeling content")).not.toBeInTheDocument()
    })

    it("redirects a denied user to /no-access with the reason", () => {
      mockRoute("/")

      renderWithTheme(
        <Layout
          accessResult={{ hasAccess: false, reason: "unleash-unavailable" }}
          user={user}
        >
          <div>labeling content</div>
        </Layout>
      )

      expect(mockReplace).toHaveBeenCalledWith(
        "/no-access?reason=unleash-unavailable"
      )
    })

    it("renders the nav and children for an allowed user", () => {
      mockRoute("/")

      renderWithTheme(
        <Layout
          accessResult={{ hasAccess: true, reason: "team-role" }}
          user={user}
        >
          <div>labeling content</div>
        </Layout>
      )

      expect(screen.getByText("labeling content")).toBeInTheDocument()
      expect(screen.getByText("roop@artsymail.com")).toBeInTheDocument()
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  describe("signed out", () => {
    it("renders the nav and a sign-in prompt instead of redirecting", () => {
      mockRoute("/")

      renderWithTheme(
        <Layout accessResult={{ hasAccess: false, reason: "denied" }}>
          <div>labeling content</div>
        </Layout>
      )

      expect(screen.queryByText("labeling content")).not.toBeInTheDocument()
      expect(
        screen.getByText("Please sign in to continue.")
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "Continue with Artsy" })
      ).toBeInTheDocument()
      expect(mockReplace).not.toHaveBeenCalled()
    })

    it("still renders public routes as-is", () => {
      mockRoute("/no-access")

      renderWithTheme(
        <Layout accessResult={{ hasAccess: false, reason: "denied" }}>
          <div>no-access page content</div>
        </Layout>
      )

      expect(screen.getByText("no-access page content")).toBeInTheDocument()
      expect(mockReplace).not.toHaveBeenCalled()
    })
  })

  it("always renders public routes regardless of access", () => {
    mockRoute("/no-access")

    renderWithTheme(
      <Layout accessResult={{ hasAccess: false, reason: "denied" }} user={user}>
        <div>no-access page content</div>
      </Layout>
    )

    expect(screen.getByText("no-access page content")).toBeInTheDocument()
    expect(mockReplace).not.toHaveBeenCalled()
  })
})
