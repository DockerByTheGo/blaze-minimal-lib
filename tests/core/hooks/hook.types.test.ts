import { describe, expectTypeOf, it } from "vitest";

import type { HookDfault } from "../../../src/core/hooks";

import { Hook } from "../../../src/core/hooks";

describe("hook type tests", () => {
  it("preserves hook name, argument, and return types", () => {
    const hook = new Hook(
      "add-token",
      (arg: { url: string }) => ({ ...arg, token: "abc123" as const }),
    );

    expectTypeOf(hook.TGetArgType).toEqualTypeOf<{ url: string }>();
    expectTypeOf(hook.TGetReturnType).toEqualTypeOf<{
      url: string;
      token: "abc123";
    }>();
  });

  it("exports the default hook alias", () => {
    expectTypeOf<HookDfault>().toEqualTypeOf<Hook<string, (arg: any) => unknown>>();
  });
});
