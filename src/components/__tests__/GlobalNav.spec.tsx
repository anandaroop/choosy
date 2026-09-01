import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useRouter } from "next/router"
import { Theme } from "@artsy/palette"
import { Session } from "next-auth"

import { federatedSignOut } from "utils/federatedSignOut"

import { GlobalNav } from "../GlobalNav"

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}))
jest.mock("utils/federatedSignOut", () => ({
  federatedSignOut: jest.fn(),
}))

const mockUseRouter = useRouter as jest.Mock
const mockFederatedSignOut = federatedSignOut as jest.Mock

function mockRoute(pathname: string) {
  mockUseRouter.mockReturnValue({ pathname })
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

describe("GlobalNav", () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    mockRoute("/")
    consoleError = jest.spyOn(console, "error").mockImplementation()
  })

  afterEach(() => {
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it("renders only the logo link when signed out", () => {
    renderWithTheme(<GlobalNav />)

    expect(screen.getAllByRole("link")).toHaveLength(1)
    expect(screen.queryByText("Label")).not.toBeInTheDocument()
    expect(screen.queryByText(/@/)).not.toBeInTheDocument()
    expect(screen.queryByText("Log out")).not.toBeInTheDocument()
  })

  it("renders the Label link, email, and Log out when signed in", () => {
    renderWithTheme(<GlobalNav user={user} />)

    expect(screen.getByText("Label")).toBeInTheDocument()
    expect(screen.getByText("roop@artsymail.com")).toBeInTheDocument()
    expect(screen.getByText("Log out")).toBeInTheDocument()
  })

  it("marks the Label link active on /label", () => {
    mockRoute("/label")

    renderWithTheme(<GlobalNav user={user} />)

    expect(screen.getByText("Label")).toHaveStyle({ opacity: "1" })
  })

  it("does not mark the Label link active elsewhere", () => {
    mockRoute("/")

    renderWithTheme(<GlobalNav user={user} />)

    expect(screen.getByText("Label")).toHaveStyle({ opacity: "0.7" })
  })

  it("calls federatedSignOut when Log out is clicked", async () => {
    const clickUser = userEvent.setup()
    renderWithTheme(<GlobalNav user={user} />)

    await clickUser.click(screen.getByText("Log out"))

    expect(mockFederatedSignOut).toHaveBeenCalledTimes(1)
  })
})
