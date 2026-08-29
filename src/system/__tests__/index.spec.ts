import { Action, assertPermitted, isPermitted, Role } from "../index"

describe("isPermitted", () => {
  it.each([Action.read, Action.manage])(
    "returns true for team on labeling.%s",
    (action) => {
      expect(isPermitted([Role.team], "labeling", action)).toBe(true)
    }
  )

  it.each([Action.read, Action.manage])(
    "returns false for a non-team role on labeling.%s",
    (action) => {
      expect(isPermitted(["some_other_role"], "labeling", action)).toBe(false)
    }
  )

  it("returns false for an empty roles list", () => {
    expect(isPermitted([], "labeling", Action.read)).toBe(false)
  })
})

describe("assertPermitted", () => {
  it("does not throw for team", () => {
    expect(() =>
      assertPermitted([Role.team], "labeling", Action.manage)
    ).not.toThrow()
  })

  it("throws for a non-team role", () => {
    expect(() =>
      assertPermitted(["some_other_role"], "labeling", Action.manage)
    ).toThrow()
  })
})
