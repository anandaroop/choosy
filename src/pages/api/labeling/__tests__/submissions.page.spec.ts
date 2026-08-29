import { createMocks, RequestMethod } from "node-mocks-http"
import { NextApiRequest, NextApiResponse } from "next"

import { SubmissionPayload } from "labeling/types"

const mockGetSessionUser = jest.fn()
const mockCheckAccess = jest.fn()
const mockCreate = jest.fn()

jest.mock("utils/auth", () => ({
  getSessionUser: (...args: unknown[]) => mockGetSessionUser(...args),
}))
jest.mock("utils/access", () => ({
  ...jest.requireActual("utils/access"),
  checkAccess: (...args: unknown[]) => mockCheckAccess(...args),
}))
jest.mock("lib/db", () => ({
  db: {
    submission: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

import handler from "../submissions.page"

function makeReqRes(
  method: RequestMethod = "POST",
  body: Partial<SubmissionPayload> = {}
) {
  return createMocks<NextApiRequest, NextApiResponse>({ method, body })
}

function validPayload(): SubmissionPayload {
  return {
    datasetVersion: "comps-v1",
    targetId: "target-1",
    ratings: [
      { candidateId: "lot-1a", rating: "strong_match", note: null },
      { candidateId: "lot-1b", rating: "weak_match", note: null },
      { candidateId: "lot-1c", rating: "no_match", note: null },
      { candidateId: "lot-1d", rating: "no_match", note: null },
    ],
    durationMs: 1000,
  }
}

describe("POST /api/labeling/submissions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetSessionUser.mockResolvedValue({ id: "user-1", roles: ["team"] })
    mockCheckAccess.mockResolvedValue({ hasAccess: true, reason: "team-role" })
  })

  it("401s when there is no session", async () => {
    mockGetSessionUser.mockResolvedValue(null)
    const { req, res } = makeReqRes("POST", validPayload())

    await handler(req, res)

    expect(res.statusCode).toBe(401)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("403s when access is denied", async () => {
    mockCheckAccess.mockResolvedValue({ hasAccess: false, reason: "denied" })
    const { req, res } = makeReqRes("POST", validPayload())

    await handler(req, res)

    expect(res.statusCode).toBe(403)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("405s on GET", async () => {
    const { req, res } = makeReqRes("GET")

    await handler(req, res)

    expect(res.statusCode).toBe(405)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("400s for an unknown dataset version, without touching the DB", async () => {
    const { req, res } = makeReqRes("POST", {
      ...validPayload(),
      datasetVersion: "bogus",
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("400s for an unknown target, without touching the DB", async () => {
    const { req, res } = makeReqRes("POST", {
      ...validPayload(),
      targetId: "bogus-target",
    })

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("400s for a missing candidate rating, without touching the DB", async () => {
    const payload = validPayload()
    payload.ratings = payload.ratings.slice(1)
    const { req, res } = makeReqRes("POST", payload)

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("400s for an illegal rating value, without touching the DB", async () => {
    const payload = validPayload()
    payload.ratings[0].rating = "definitely_a_match" as never
    const { req, res } = makeReqRes("POST", payload)

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("400s for a negative durationMs, without touching the DB", async () => {
    const payload = validPayload()
    payload.durationMs = -1
    const { req, res } = makeReqRes("POST", payload)

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it("201s on a valid submission, with labelerId from the session and a single nested create", async () => {
    mockCreate.mockResolvedValue({ id: "submission-1" })
    const payload = validPayload()
    const { req, res } = makeReqRes("POST", payload)

    await handler(req, res)

    expect(res.statusCode).toBe(201)
    expect(res._getJSONData()).toEqual({
      ok: true,
      submissionId: "submission-1",
    })
    expect(mockCreate).toHaveBeenCalledTimes(1)
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        labelerId: "user-1",
        datasetId: payload.datasetVersion,
        targetLotId: payload.targetId,
        durationMs: payload.durationMs,
        ratings: {
          create: payload.ratings.map((r) => ({
            candidateLotId: r.candidateId,
            rating: r.rating,
            note: r.note,
          })),
        },
      },
    })
  })

  it("ignores a labelerId in the request body, always using the session's", async () => {
    mockCreate.mockResolvedValue({ id: "submission-1" })
    const payload = { ...validPayload(), labelerId: "someone-else" }
    const { req, res } = makeReqRes("POST", payload as never)

    await handler(req, res)

    expect(res.statusCode).toBe(201)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ labelerId: "user-1" }),
      })
    )
  })

  it("409s on a duplicate submission (Prisma P2002)", async () => {
    mockCreate.mockRejectedValue(
      Object.assign(new Error("Unique constraint failed"), { code: "P2002" })
    )
    const { req, res } = makeReqRes("POST", validPayload())

    await handler(req, res)

    expect(res.statusCode).toBe(409)
  })

  it("rethrows non-P2002 errors", async () => {
    mockCreate.mockRejectedValue(new Error("connection lost"))
    const { req, res } = makeReqRes("POST", validPayload())

    await expect(handler(req, res)).rejects.toThrow("connection lost")
  })
})
