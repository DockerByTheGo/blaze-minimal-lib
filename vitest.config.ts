import { defineConfig } from "vitest/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@src": resolve(currentDir, "src"),
      "@test": resolve(currentDir, "tests"),
      "@better-standard-internal": resolve(currentDir, "../../../../utils/better-standard-lib/src"),
      "../../../../../blazy-edge/main-app/src": resolve(currentDir, "../blazy-edge/framework/src"),
    },
  },
  test: {
    environment: "node",
    include: [
      "tests/utils/testHelpers.test.ts",
      "tests/core/utils/testHelpers.test.ts",
      "tests/unit/core/server/utils/path/Path.test.ts",
      "tests/unit/core/server/main/integration/main.test.ts",
    ],
  },
});
