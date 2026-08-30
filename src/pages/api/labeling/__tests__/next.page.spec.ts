import { createMocks, RequestMethod } from "node-mocks-http"
import { NextApiRequest, NextApiResponse } from "next"

import { NextItemResponse } from "labeling/types"

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

import handler from "../next.page"

function makeReqRes(
  method: RequestMethod = "GET",
  query: Record<string, string> = {}
) {
  return createMocks<NextApiRequest, NextApiResponse>({ method, query })
}

function jsonBody(res: ReturnType<typeof makeReqRes>["res"]): NextItemResponse {
  return res._getJSONData() as NextItemResponse
}

describe("GET /api/labeling/next", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSessionUser.mockResolvedValue({ id: "user-1", roles: ["team"] })
    mockCheckAccess.mockResolvedValue({ hasAccess: true, reason: "team-role" })
  })

  it("401s when there is no session", async () => {
    mockGetSessionUser.mockResolvedValue(null)
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(401)
  })

  it("403s when access is denied", async () => {
    mockCheckAccess.mockResolvedValue({ hasAccess: false, reason: "denied" })
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(403)
  })

  it("200s with the next item and progress when work remains", async () => {
    mockGetCompletedTargetIds.mockResolvedValue([])
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const body = jsonBody(res)
    expect(body.item?.targetId).toBe("target-1")
    expect(body.progress).toEqual({ completed: 0, total: 3, remaining: 3 })
    expect(body.datasetVersion).toEqual(expect.any(String))
  })

  it("200s with item: null when the queue is exhausted", async () => {
    mockGetCompletedTargetIds.mockResolvedValue([
      "target-1",
      "target-2",
      "target-3",
    ])
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    const body = jsonBody(res)
    expect(body.item).toBeNull()
    expect(body.progress).toEqual({ completed: 3, total: 3, remaining: 0 })
  })

  it("scopes the completed-ids query to labelerId and datasetId only", async () => {
    mockGetCompletedTargetIds.mockResolvedValue([])
    const { req, res } = makeReqRes()

    await handler(req, res)

    expect(mockGetCompletedTargetIds).toHaveBeenCalledWith(
      "user-1",
      expect.any(String)
    )
  })

  it("reopens a specific target via ?targetId= when not yet submitted", async () => {
    mockGetCompletedTargetIds.mockResolvedValue([])
    const { req, res } = makeReqRes("GET", { targetId: "target-2" })

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(jsonBody(res).item?.targetId).toBe("target-2")
  })

  it("409s when reopening a target already submitted by this labeler", async () => {
    mockGetCompletedTargetIds.mockResolvedValue(["target-2"])
    const { req, res } = makeReqRes("GET", { targetId: "target-2" })

    await handler(req, res)

    expect(res.statusCode).toBe(409)
  })

  it("405s on POST", async () => {
    const { req, res } = makeReqRes("POST")

    await handler(req, res)

    expect(res.statusCode).toBe(405)
  })
})
