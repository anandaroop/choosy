import { createMocks } from "node-mocks-http"
import { NextApiRequest, NextApiResponse } from "next"

import handler from "../status.page"

describe("GET /api/status", () => {
  it("returns 200 OK with no session present", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    })

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res._getJSONData()).toEqual({ status: "OK" })
  })
})
