import { defineConfig } from "vitest/config";
import { resolve } from "path";

const root = resolve(__dirname);

export default defineConfig({
  resolve: {
    alias: {
      "@applyagent/llm": resolve(root, "packages/llm/src/index.ts"),
      "@applyagent/candidate": resolve(root, "packages/candidate/src/index.ts"),
      "@applyagent/browser": resolve(root, "packages/browser/src/index.ts"),
      "@applyagent/answer-engine": resolve(root, "packages/answer-engine/src/index.ts"),
      "@applyagent/policy": resolve(root, "packages/policy/src/index.ts"),
      "@applyagent/database": resolve(root, "packages/database/src/index.ts"),
      "@applyagent/agent": resolve(root, "packages/agent/src/index.ts"),
      "@applyagent/job": resolve(root, "packages/job/src/index.ts"),
      "@applyagent/ats": resolve(root, "packages/ats/src/index.ts"),
    },
  },
  test: {
    include: [
      "tests/unit/**/*.test.ts",
      "tests/browser/**/*.test.ts",
      "packages/*/src/**/*.test.ts",
    ],
    exclude: ["**/node_modules/**", "**/dist/**"],
    environment: "node",
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
