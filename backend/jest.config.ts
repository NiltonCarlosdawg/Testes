import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@/(.*)\\.js$": "<rootDir>/src/$1.ts",
    "^@/(.*)$": "<rootDir>/src/$1.ts"
  },
  
  setupFiles: ["dotenv/config"],
  testEnvironmentOptions: {
    DOTENV_CONFIG_PATH: ".env.test"
  },
  extensionsToTreatAsEsm: [".ts"],
  
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          target: "ES2022",
          module: "ESNext",
          moduleResolution: "NodeNext",
          allowSyntheticDefaultImports: true,
          baseUrl: ".",
          paths: {
            "@/*": ["src/*"]
          }
        }
      }
    ]
  },
  
  moduleFileExtensions: ["ts", "js", "json", "node"],
  
  // Ignorar node_modules, exceto se necessário
  transformIgnorePatterns: [
    "node_modules/(?!(your-modules|that-need-transformation)/)"
  ]
};

export default config;