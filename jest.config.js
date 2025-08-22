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
  collectCoverageFrom: ["utils/**/*.ts", "!**/node_modules/**", "!**/build/**"],
  moduleNameMapper: {
    "^~(.*)$": "<rootDir>/$1"
  }
}

module.exports = config
