import "@testing-library/jest-dom"
import React from "react"
import { StyleSheetManager } from "styled-components"
import { shouldForwardProp } from "utils/shouldForwardProp"

jest.mock("next/router", () => require("next-router-mock"))

// Wrap every render() in the same StyleSheetManager filter Boot.tsx uses in
// the app, so styled-system props (bg, gap, flexDirection, borderColor, etc.)
// don't leak onto DOM elements and spam "React does not recognize the ...
// prop" warnings in test output. Composes with any wrapper a test already
// passes rather than replacing it. Mirrors forque#2148.
jest.mock("@testing-library/react", () => {
  const actual = jest.requireActual("@testing-library/react")

  const Filter = ({ children }) =>
    React.createElement(StyleSheetManager, { shouldForwardProp }, children)

  return {
    ...actual,
    render: (ui, options = {}) => {
      const Inner = options.wrapper
      const wrapper = Inner
        ? ({ children }) =>
            React.createElement(
              Filter,
              null,
              React.createElement(Inner, null, children)
            )
        : Filter
      return actual.render(ui, { ...options, wrapper })
    },
  }
})
