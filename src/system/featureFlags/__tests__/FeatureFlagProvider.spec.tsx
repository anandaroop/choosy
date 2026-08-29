import { render } from "@testing-library/react"
import { useSession } from "next-auth/react"

import { FeatureFlagProvider } from "../FeatureFlagProvider"

const mockUpdateContext = jest.fn()

jest.mock("@unleash/proxy-client-react", () => ({
  FlagProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useUnleashContext: () => mockUpdateContext,
}))

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}))

const mockUseSession = useSession as jest.Mock

describe("FeatureFlagProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("does not call updateContext when there is no session", () => {
    mockUseSession.mockReturnValue({ data: null })

    render(
      <FeatureFlagProvider>
        <div>content</div>
      </FeatureFlagProvider>
    )

    expect(mockUpdateContext).not.toHaveBeenCalled()
  })

  it("calls updateContext with the resolved userId once the session resolves", () => {
    mockUseSession.mockReturnValue({ data: null })
    const { rerender } = render(
      <FeatureFlagProvider>
        <div>content</div>
      </FeatureFlagProvider>
    )

    mockUseSession.mockReturnValue({
      data: { user: { id: "user-42" } },
    })
    rerender(
      <FeatureFlagProvider>
        <div>content</div>
      </FeatureFlagProvider>
    )

    expect(mockUpdateContext).toHaveBeenCalledWith({ userId: "user-42" })
  })
})
