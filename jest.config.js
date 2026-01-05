/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json"
      }
    ]
  },
  setupFiles: ["./jest.setup.js"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  collectCoverage: true,
  collectCoverageFrom: [
    "utils/**/*.ts",
    "hooks/**/*.ts",
    "parser/**/*.ts",
    "!**/node_modules/**",
    "!**/build/**",
    "!**/__tests__/**",
    "!**/__mocks__/**"
  ],
  moduleNameMapper: {
    "^~(.*)$": "<rootDir>/$1",
    "^../parser/htmlParser$": "<rootDir>/__mocks__/parser/htmlParser.ts"
  }
}

module.exports = config
