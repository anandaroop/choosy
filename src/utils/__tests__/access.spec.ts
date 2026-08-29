import { checkAccess, LABELING_ACCESS_FLAG } from "../access"

const mockIsFlagEnabledForUser = jest.fn()

jest.mock("lib/unleash/server", () => ({
  isFlagEnabledForUser: (...args: unknown[]) =>
    mockIsFlagEnabledForUser(...args),
}))

describe("checkAccess", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("denies when there is no user", async () => {
    const result = await checkAccess(null)
    expect(result).toEqual({ hasAccess: false, reason: "denied" })
    expect(mockIsFlagEnabledForUser).not.toHaveBeenCalled()
  })

  it("grants team users access without calling Unleash (flag enabled)", async () => {
    mockIsFlagEnabledForUser.mockResolvedValue({
      enabled: true,
      available: true,
    })

    const result = await checkAccess({ id: "user-1", roles: ["team"] })

    expect(result).toEqual({ hasAccess: true, reason: "team-role" })
    expect(mockIsFlagEnabledForUser).not.toHaveBeenCalled()
  })

  it("grants team users access without calling Unleash (flag disabled)", async () => {
    mockIsFlagEnabledForUser.mockResolvedValue({
      enabled: false,
      available: true,
    })

    const result = await checkAccess({ id: "user-1", roles: ["team"] })

    expect(result).toEqual({ hasAccess: true, reason: "team-role" })
    expect(mockIsFlagEnabledForUser).not.toHaveBeenCalled()
  })

  it("grants non-team users access when the flag is enabled for them", async () => {
    mockIsFlagEnabledForUser.mockResolvedValue({
      enabled: true,
      available: true,
    })

    const result = await checkAccess({ id: "user-2", roles: [] })

    expect(result).toEqual({ hasAccess: true, reason: "feature-flag" })
    expect(mockIsFlagEnabledForUser).toHaveBeenCalledWith(
      LABELING_ACCESS_FLAG,
      "user-2"
    )
  })

  it("denies non-team users when the flag is disabled for them", async () => {
    mockIsFlagEnabledForUser.mockResolvedValue({
      enabled: false,
      available: true,
    })

    const result = await checkAccess({ id: "user-2", roles: [] })

    expect(result).toEqual({ hasAccess: false, reason: "denied" })
  })

  it("fails closed for non-team users when Unleash is unavailable", async () => {
    mockIsFlagEnabledForUser.mockResolvedValue({
      enabled: false,
      available: false,
    })

    const result = await checkAccess({ id: "user-2", roles: [] })

    expect(result).toEqual({ hasAccess: false, reason: "unleash-unavailable" })
  })
})
