const mockOnce = jest.fn()
const mockIsEnabled = jest.fn()
const mockDestroy = jest.fn()

const mockInitialize = jest.fn((_config: unknown) => ({
  once: mockOnce,
  isEnabled: mockIsEnabled,
  destroy: mockDestroy,
}))

jest.mock("unleash-client", () => ({
  initialize: (config: unknown) => mockInitialize(config),
  UnleashEvents: { Ready: "ready", Error: "error" },
}))

describe("isFlagEnabledForUser", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("returns available: false when UNLEASH_SERVER_KEY is unset", async () => {
    delete process.env.UNLEASH_SERVER_KEY
    const { isFlagEnabledForUser } = await import("../server")

    const result = await isFlagEnabledForUser("some-flag", "user-1")

    expect(result).toEqual({ enabled: false, available: false })
    expect(mockInitialize).not.toHaveBeenCalled()
  })

  it("passes { userId } as per-call context", async () => {
    process.env.UNLEASH_SERVER_KEY = "test-key"
    mockOnce.mockImplementation((event: string, cb: () => void) => {
      if (event === "ready") cb()
    })
    mockIsEnabled.mockReturnValue(true)
    const { isFlagEnabledForUser } = await import("../server")

    const result = await isFlagEnabledForUser("some-flag", "user-42")

    expect(mockIsEnabled).toHaveBeenCalledWith("some-flag", {
      userId: "user-42",
    })
    expect(result).toEqual({ enabled: true, available: true })
  })

  it("creates the singleton only once across multiple calls", async () => {
    process.env.UNLEASH_SERVER_KEY = "test-key"
    mockOnce.mockImplementation((event: string, cb: () => void) => {
      if (event === "ready") cb()
    })
    mockIsEnabled.mockReturnValue(false)
    const { isFlagEnabledForUser } = await import("../server")

    await isFlagEnabledForUser("flag-a", "user-1")
    await isFlagEnabledForUser("flag-b", "user-2")

    expect(mockInitialize).toHaveBeenCalledTimes(1)
  })
})
