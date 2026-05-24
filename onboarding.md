# Onboarding

This package is a small TypeScript backend library inside a larger workspace. The codebase leans heavily on type-safety, small composable primitives, and fast local feedback.

## Core Practices

- Write TypeScript in `strict` mode.
- Prefer small focused classes and utilities over large multi-purpose modules.
- Keep runtime behavior and type-level behavior both tested when a feature relies on inference.
- Reuse the public entry points and existing aliases such as `@src` and `@test` instead of introducing ad hoc import paths.
- Keep tests close to the behavior they describe and use dedicated type-test files for inference-heavy APIs.

## Standards Used

### TypeScript

The package uses [tsconfig.json](/Users/radoslavtsvetanov/Desktop/personal/Diplomna/project/apps/backend-framework/core/blaze-minimal-lib/tsconfig.json) with `strict: true`.

Why:
- This library exposes framework primitives, so weak typing would leak problems into every consumer.
- Strict mode helps us catch broken generic flows, missing fields, and invalid handler contracts before runtime.

### ESLint

Linting is based on [eslint.config.js](/Users/radoslavtsvetanov/Desktop/personal/Diplomna/project/apps/backend-framework/core/blaze-minimal-lib/eslint.config.js) using `@antfu/eslint-config`.

What that means in practice:
- We keep code style consistent without spending time debating formatting details.
- Some stylistic rules are intentionally relaxed because this repo values readability and iteration speed over rigid formatting.
- Naming still matters. Source filenames are expected to stay in `camelCase` or `PascalCase`.

### Testing Structure

Tests are discovered through [vitest.config.ts](/Users/radoslavtsvetanov/Desktop/personal/Diplomna/project/apps/backend-framework/core/blaze-minimal-lib/vitest.config.ts) with:

- `environment: "node"`
- `include: ["tests/**/*.test.ts"]`
- coverage configured against `src/**/*.ts`

Current convention:
- Runtime behavior tests live under `tests/unit/...`
- Type-focused tests live under `tests/types/...`

Why:
- Runtime tests protect actual behavior.
- Type tests protect inference and API contracts that are easy to break during refactors, especially around router hooks and handler generics.

## Why We Use Both Bun and Vitest

We use both because this library is Bun-first, but not Bun-only.

The intended experience is Bun-first:
- the framework is designed primarily around Bun
- Bun is the fastest path for day-to-day development
- Bun behavior matters to us as a first-class target

At the same time, we still support Node:
- consumers may run the package in Node-based environments
- cross-runtime compatibility is part of the contract
- a change that works only in Bun is not enough for this package

That is why we keep both Bun's test runner and Vitest in the workflow.

### Why Vitest is used

Vitest helps us test across environments more easily.

We use it for:
- flexible test execution when validating behavior outside the Bun-native path
- `describe` / `it` style tests and familiar assertion APIs
- `expectTypeOf` and other type-testing utilities
- dedicated type-test suites where Bun's current type-testing ergonomics are not strong enough

Why not Bun alone:
- Bun's type-testing utilities are currently more limited
- Vitest gives us a smoother setup for inference-heavy tests
- Vitest makes it easier to structure tests when we want to think beyond only the Bun runtime

### Why Bun test is still important

We also use Bun's native runner directly, especially for coverage.

Why:
- Bun coverage is important for the Bun-first runtime path
- the Vitest path has practical coverage limitations in this repo
- Vitest currently does not implement `node:inspector` in the way we need here
- the available workarounds and fixes are still shaky, so Bun remains the more reliable option for coverage-focused runs

## `bun test` vs `bun run test`

This is the important distinction for contributors:

- `bun test` uses bun to run the bun test framework which uses the bun runtime to execute the tests
- `bun run test` runs the `test` script from [package.json](/Users/radoslavtsvetanov/Desktop/personal/Diplomna/project/apps/backend-framework/core/blaze-minimal-lib/package.json), which in this repo executes Vitest, uses bun to execute the vitest test framework runner which uses the node runtime to execute the tests

When to use which:
- Use `bun test` when you want Bun-native execution or Bun-driven coverage behavior
- Use `bun run test` when you want the Vitest suite and its testing utilities
- Use `bun run test:types` for dedicated type-focused tests

The short version:
- Bun helps us validate the Bun-first runtime path
- Vitest helps us validate broader compatibility and gives us stronger type-testing utilities
- we keep both because supporting Bun well and supporting Node responsibly are both part of the library's goal

## Recommended Workflow

For most changes:

1. Make the code change.
2. Run `bun run test`.
3. Run `bun run test:types` if the change touches generics, public types, hooks, or router inference.
4. Run `bun test` when you want to verify Bun-native execution or coverage behavior.
5. Run `bun run build` to type-check the package.

## Contribution Notes

- If a refactor changes generic behavior, add or update a type test.
- If a change affects routing or hooks, prefer covering both runtime flow and inferred types.
- Keep docs aligned with the actual scripts in `package.json`. If the tooling changes, update this file too.
