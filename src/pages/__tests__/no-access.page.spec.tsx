import { render, screen } from "@testing-library/react"
import { useRouter } from "next/router"

import NoAccess from "../no-access.page"

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))

// getServerSideProps pulls in utils/auth -> next-auth's runtime
// (openid-client/jose), which doesn't run under Jest's jsdom environment.
// This suite only exercises the component, so that chain isn't needed here.
jest.mock("utils/auth", () => ({
  getSessionUser: jest.fn(),
}))

const mockUseRouter = useRouter as jest.Mock

describe("NoAccess page", () => {
  it("shows retry wording, not 'not on the list' wording, when Unleash is unavailable", () => {
    mockUseRouter.mockReturnValue({
      query: { reason: "unleash-unavailable" },
    })

    render(<NoAccess email="user@example.com" userId="user-1" />)

    expect(screen.getAllByText(/couldn't verify/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/isn't enrolled/i)).not.toBeInTheDocument()
  })

  it("shows 'not enrolled' wording when denied outright", () => {
    mockUseRouter.mockReturnValue({
      query: { reason: "denied" },
    })

    render(<NoAccess email="user@example.com" userId="user-1" />)

    expect(screen.getByText(/isn't enrolled/i)).toBeInTheDocument()
    expect(screen.queryByText(/couldn't verify/i)).not.toBeInTheDocument()
  })

  it("shows the user's email and Gravity user id", () => {
    mockUseRouter.mockReturnValue({
      query: { reason: "denied" },
    })

    render(<NoAccess email="user@example.com" userId="user-1" />)

    expect(screen.getByText("user@example.com")).toBeInTheDocument()
    expect(screen.getByText("user-1")).toBeInTheDocument()
  })
})
