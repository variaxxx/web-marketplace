export default {
  displayName: "api-gateway",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
  coverageDirectory: "../../coverage/apps/api-gateway",

  // for e2e tests
  roots: ["<rootDir>/src", "<rootDir>/test"],
  testMatch: ["**/?(*.)+(spec|e2e-spec).[tj]s?(x)"],
};
