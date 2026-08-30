module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
    jest: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { vars: "all", argsIgnorePattern: "^_" },
    ],
  },
  overrides: [
    {
      // Jest/RTL component tests only — scoped here (rather than applied
      // root-wide) so these rules don't misfire on Playwright specs in e2e/,
      // which use their own `getByRole`/`expect` conventions.
      files: ["src/**/*.{spec,test}.{ts,tsx}"],
      plugins: ["testing-library", "jest-dom"],
      extends: ["plugin:testing-library/react", "plugin:jest-dom/recommended"],
      rules: {
        "testing-library/render-result-naming-convention": "off",
      },
    },
    {
      // Playwright fixtures use a `use` callback param that trips the
      // react-hooks "hook naming" heuristic, and an intentionally empty
      // first destructured param (Playwright's own fixture convention).
      files: ["e2e/**/*.ts"],
      rules: {
        "react-hooks/rules-of-hooks": "off",
        "no-empty-pattern": "off",
      },
    },
  ],
}
