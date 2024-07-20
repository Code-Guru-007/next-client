// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "@eGroupAI/hooks/(.*)": "<rootDir>/@eGroupAI/hooks/$1",
    "@eGroupAI/material/(.*)": "<rootDir>/@eGroupAI/material/$1",
    "@eGroupAI/material-icons/(.*)": "<rootDir>/@eGroupAI/material-icons/$1",
    "@eGroupAI/material-intl/(.*)": "<rootDir>/@eGroupAI/material-intl/$1",
    "@eGroupAI/material-lab/(.*)": "<rootDir>/@eGroupAI/material-lab/$1",
    "@eGroupAI/material-layout/(.*)": "<rootDir>/@eGroupAI/material-layout/$1",
    "@eGroupAI/material-module/(.*)": "<rootDir>/@eGroupAI/material-module/$1",
    "@eGroupAI/redux-modules/(.*)": "<rootDir>/@eGroupAI/redux-module/$1",
    "@eGroupAI/testing-utils/(.*)": "<rootDir>/@eGroupAI/testing-utils/$1",
    "@eGroupAI/typings/(.*)": "<rootDir>/@eGroupAI/typings/$1",
    "@eGroupAI/utils/(.*)": "<rootDir>/@eGroupAI/utils/$1",
  },
  testEnvironment: "jsdom",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);
