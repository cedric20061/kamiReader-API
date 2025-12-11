const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@config/prisma$": "<rootDir>/src/__mocks__/prisma.ts",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
  },
};
