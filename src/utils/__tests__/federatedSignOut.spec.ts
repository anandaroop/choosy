import { signOut } from "next-auth/react"

import { federatedSignOut } from "../federatedSignOut"

jest.mock("next-auth/react", () => ({
  signOut: jest.fn(),
}))

const mockSignOut = signOut as jest.Mock

describe("federatedSignOut", () => {
  const originalLocation = window.location
  const originalGravityUrl = process.env.NEXT_PUBLIC_GRAVITY_URL

  beforeEach(() => {
    jest.clearAllMocks()
    mockSignOut.mockResolvedValue(undefined)
    process.env.NEXT_PUBLIC_GRAVITY_URL = "https://stagingapi.artsy.net"

    // jsdom's real Location rejects a plain assignment ("Not implemented:
    // navigation") — swap in a plain object so setting .href is just a
    // property write we can assert on, not a real page navigation attempt.
    Object.defineProperty(window, "location", {
      writable: true,
      value: { href: "", origin: "https://localhost:3000" },
    })
  })

  afterEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    })
    process.env.NEXT_PUBLIC_GRAVITY_URL = originalGravityUrl
  })

  it("signs out of next-auth without its own redirect", async () => {
    await federatedSignOut()

    expect(mockSignOut).toHaveBeenCalledWith({ redirect: false })
  })

  it("redirects to Gravity's session-destroy endpoint with an encoded, origin-scoped redirect_uri", async () => {
    await federatedSignOut()

    expect(window.location.href).toBe(
      "https://stagingapi.artsy.net/api/v1/sessions/destroy?redirect_uri=https%3A%2F%2Flocalhost%3A3000"
    )
  })
})
