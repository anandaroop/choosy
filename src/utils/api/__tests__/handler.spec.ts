import { createResponse } from "node-mocks-http"
import { NextApiResponse } from "next"

import { ApiError } from "labeling/types"

import {
  methodNotAllowed,
  requireAccess,
  requireUser,
  sendError,
} from "../handler"

const mockCheckAccess = jest.fn()

jest.mock("utils/access", () => ({
  ...jest.requireActual("utils/access"),
  checkAccess: (...args: unknown[]) => mockCheckAccess(...args),
}))

function makeRes() {
  return createResponse<NextApiResponse<ApiError>>()
}

function jsonBody(res: ReturnType<typeof makeRes>): ApiError {
  return res._getJSONData() as ApiError
}

describe("sendError", () => {
  it("sets status and JSON body", () => {
    const res = makeRes()
    sendError(res, 418, "teapot")
    expect(res.statusCode).toBe(418)
    expect(jsonBody(res)).toEqual({ error: "teapot" })
  })
})

describe("methodNotAllowed", () => {
  it("sets 405, Allow header, and error body", () => {
    const res = makeRes()
    methodNotAllowed(res, ["GET", "POST"])
    expect(res.statusCode).toBe(405)
    expect(res.getHeader("Allow")).toEqual(["GET", "POST"])
    expect(jsonBody(res).error).toMatch(/GET, POST/)
  })
})

describe("requireUser", () => {
  it("sends 401 and returns null when there is no session user", () => {
    const res = makeRes()
    const result = requireUser(res, null)
    expect(result).toBeNull()
    expect(res.statusCode).toBe(401)
  })

  it("returns the user when present, without writing to the response", () => {
    const res = makeRes()
    const user = { id: "user-1", roles: ["team"] }
    const result = requireUser(res, user)
    expect(result).toBe(user)
    expect(res.statusCode).toBe(200)
  })
})

describe("requireAccess", () => {
  const user = { id: "user-1", roles: [] }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns true and writes nothing when access is granted", async () => {
    mockCheckAccess.mockResolvedValue({ hasAccess: true, reason: "team-role" })
    const res = makeRes()

    const result = await requireAccess(res, user)

    expect(result).toBe(true)
    expect(res.statusCode).toBe(200)
  })

  it("sends 403 with a generic denial message when reason is 'denied'", async () => {
    mockCheckAccess.mockResolvedValue({ hasAccess: false, reason: "denied" })
    const res = makeRes()

    const result = await requireAccess(res, user)

    expect(result).toBe(false)
    expect(res.statusCode).toBe(403)
    expect(jsonBody(res).error).toMatch(/do not have access/)
  })

  it("sends 403 with an unleash-unavailable-specific message", async () => {
    mockCheckAccess.mockResolvedValue({
      hasAccess: false,
      reason: "unleash-unavailable",
    })
    const res = makeRes()

    const result = await requireAccess(res, user)

    expect(result).toBe(false)
    expect(res.statusCode).toBe(403)
    expect(jsonBody(res).error).toMatch(/temporarily unavailable/)
  })
})
