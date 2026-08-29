import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"

import { jwt, session, signIn } from "../authCallbacks"

describe("signIn", () => {
  it("succeeds unconditionally, regardless of roles", async () => {
    await expect(signIn()).resolves.toBe(true)
  })
})

describe("jwt", () => {
  it("carries roles from the OAuth profile onto the token", async () => {
    const token = await jwt({
      token: {} as JWT,
      profile: { roles: ["team"] },
    })
    expect(token.roles).toEqual(["team"])
  })

  it("leaves the token unchanged when no profile is present (token refresh)", async () => {
    const token = await jwt({
      token: { roles: ["team"] } as JWT,
      profile: undefined,
    })
    expect(token.roles).toEqual(["team"])
  })
})

describe("session", () => {
  it("maps token.sub to user.id and token.roles to user.roles", async () => {
    const result = await session({
      session: { user: {}, expires: "" } as unknown as Session,
      token: { sub: "user-1", roles: ["team"] } as JWT,
    })
    expect(result.user.id).toBe("user-1")
    expect(result.user.roles).toEqual(["team"])
  })
})
