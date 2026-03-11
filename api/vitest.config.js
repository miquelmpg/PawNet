import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        setupFiles: ["./tests/setup.js"],
        include: ["**/tests/**/*.test.js"],
        testTimeout: 10000,
        fileParallelism: false,
    },
});