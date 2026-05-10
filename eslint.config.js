import antfu from "@antfu/eslint-config";

export default antfu(
  {
    type: "lib",
    typescript: true,
    stylistic: false,
    formatters: false,
  },
  {
    ignores: [
      "docs/**",
      "node_modules/**",
      "**/README.md",
    ],
    rules: {
      "antfu/consistent-list-newline": "off",
      "antfu/no-top-level-await": "off",
      "import/no-duplicates": "off",
      "no-console": "off",
      "no-useless-return": "off",
      "node/no-process-env": "off",
      "node/prefer-global/process": "off",
      "perfectionist/sort-exports": "off",
      "perfectionist/sort-imports": "off",
      "style/arrow-parens": "off",
      "style/block-spacing": "off",
      "style/brace-style": "off",
      "style/comma-dangle": "off",
      "style/comma-spacing": "off",
      "style/eol-last": "off",
      "style/indent": "off",
      "style/key-spacing": "off",
      "style/member-delimiter-style": "off",
      "style/no-multi-spaces": "off",
      "style/no-multiple-empty-lines": "off",
      "style/no-trailing-spaces": "off",
      "style/object-curly-spacing": "off",
      "style/padded-blocks": "off",
      "style/semi": "off",
      "style/semi-spacing": "off",
      "style/type-annotation-spacing": "off",
      "test/prefer-lowercase-title": "off",
      "ts/consistent-type-definitions": "off",
      "ts/consistent-type-imports": "off",
      "ts/explicit-function-return-type": "off",
      "ts/no-empty-object-type": "off",
      "unicorn/filename-case": ["error", {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      }],
      "unused-imports/no-unused-imports": "off",
      "unused-imports/no-unused-vars": "off",
    },
  },
  {
    files: ["src/**/*.ts", "index.ts", "vitest.config.ts"],
    rules: {
      "new-cap": "off",
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "new-cap": "off",
      "node/handle-callback-err": "off",
      "unicorn/filename-case": "off",
    },
  },
);
