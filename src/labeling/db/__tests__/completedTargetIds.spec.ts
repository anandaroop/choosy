const mockFindMany = jest.fn()

jest.mock("lib/db", () => ({
  db: {
    submission: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

import { getCompletedTargetIds } from "../completedTargetIds"

describe("getCompletedTargetIds", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("queries scoped to labelerId and datasetId only, returning targetLotIds", async () => {
    mockFindMany.mockResolvedValue([
      { targetLotId: "target-1" },
      { targetLotId: "target-2" },
    ])

    const result = await getCompletedTargetIds("labeler-1", "dataset-v1")

    expect(mockFindMany).toHaveBeenCalledWith({
      where: { labelerId: "labeler-1", datasetId: "dataset-v1" },
      select: { targetLotId: true },
    })
    expect(result).toEqual(["target-1", "target-2"])
  })

  it("returns an empty array when nothing is completed", async () => {
    mockFindMany.mockResolvedValue([])
    const result = await getCompletedTargetIds("labeler-1", "dataset-v1")
    expect(result).toEqual([])
  })
})
