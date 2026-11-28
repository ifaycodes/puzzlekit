import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["packages/**/tests/**/*.test.{ts,tsx}", "my_apps/**/tests/**/*.test.{ts,tsx}"],
    coverage: {
      include: ["packages/core/src/**/*.ts"],
      exclude: ["packages/core/src/index.ts"]
    },
    globals: true
  }
});
