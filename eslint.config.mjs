import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }], // This will warn on console.log, but allow console.warn and console.error
    },
  },
]
