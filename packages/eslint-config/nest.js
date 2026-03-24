import globals from "globals";
import { config as baseConfig } from "./base.js";

/**
 * ESLint flat config for NestJS apps (Node, Jest tests, shared monorepo rules).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const nestConfig = [
  ...baseConfig,
  {
    ignores: ["eslint.config.mjs", "eslint.config.js", "eslint.config.cjs"],
  },
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ["**/*.spec.ts", "test/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
];
