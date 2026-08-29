import { createMocks, RequestMethod } from "node-mocks-http"
import { NextApiRequest, NextApiResponse } from "next"

const mockGetSessionUser = jest.fn()
const mockCheckAccess = jest.fn()
const mockGetCompletedTargetIds = jest.fn()

jest.mock("utils/auth", () => ({
  getSessionUser: (...args: unknown[]) => mockGetSessionUser(...args),
}))
jest.mock("utils/access", () => ({
  ...jest.requireActual("utils/access"),
  checkAccess: (...args: unknown[]) => mockCheckAccess(...args),
}))
jest.mock("labeling/db/completedTargetIds", () => ({
  getCompletedTargetIds: (...args: unknown[]) =>
    mockGetCompletedTargetIds(...args),
}))

import handler from "../progress.page"

function makeReqRes(method: RequestMethod = "GET") {
  return createMocks<NextApiRequest, NextApiResponse>({ method })
}

describe("GET /api/labeling/progress", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("401s when there is no session", async () => {
    mockGetSessionUser.mockResolvedValue(null)
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(401)
  })

  it("403s when access is denied", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "user-1", roles: [] })
    mockCheckAccess.mockResolvedValue({ hasAccess: false, reason: "denied" })
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(403)
  })

  it("200s with the correct progress shape when access is granted", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "user-1", roles: ["team"] })
    mockCheckAccess.mockResolvedValue({ hasAccess: true, reason: "team-role" })
    mockGetCompletedTargetIds.mockResolvedValue(["target-1"])
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({
      completed: 1,
      total: 3,
      remaining: 2,
    })
    expect(mockGetCompletedTargetIds).toHaveBeenCalledWith(
      "user-1",
      expect.any(String)
    )
  })

  it("405s on POST", async () => {
    mockGetSessionUser.mockResolvedValue({ id: "user-1", roles: ["team"] })
    const { req, res } = makeReqRes("POST")

    await handler(req, res)

    expect(res.statusCode).toBe(405)
  })
})
