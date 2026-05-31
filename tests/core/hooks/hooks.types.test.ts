import { describe, expectTypeOf, it } from "vitest";

import type { HooksDefault } from "../../../src/core/hooks";

import { Hook, Hooks } from "../../../src/core/hooks";

describe("hooks type tests", () => {
  it("threads each added hook from the previous hook return type", () => {
    const hooks = Hooks
      .empty()
      .add({
        name: "add-token",
        handler: (arg: { url: string }) => ({ ...arg, token: "abc123" as const }),
      })
      .add({
        name: "add-user",
        handler: (arg) => {
          expectTypeOf(arg).toEqualTypeOf<{
            url: string;
            token: "abc123";
          }>();

          return { ...arg, userId: 42 as const };
        },
      });

    expectTypeOf(hooks.TGetHookNames).toEqualTypeOf<"add-token" | "add-user">();
    expectTypeOf(hooks.TGetLastHookReturnType).toEqualTypeOf<{
      url: string;
      token: "abc123";
      userId: 42;
    }>();
    expectTypeOf(hooks.TGetLastHook).toEqualTypeOf<Hook<"add-user", (arg: {
      url: string;
      token: "abc123";
    }) => {
      url: string;
      token: "abc123";
      userId: 42;
    }>>();
  });

  it("exposes a hook lookup type constrained by known hook names", () => {
    const hooks = Hooks
      .empty()
      .add({
        name: "add-token",
        handler: (arg: { url: string }) => ({ ...arg, token: "abc123" as const }),
      })
      .add({
        name: "add-user",
        handler: arg => ({ ...arg, userId: 42 as const }),
      });

    type AddTokenHook = ReturnType<typeof hooks.TGetHookByName<"add-token">>;
    type AddUserHook = ReturnType<typeof hooks.TGetHookByName<"add-user">>;

    expectTypeOf<AddTokenHook>().toEqualTypeOf<
      Hook<"add-token", (arg: { url: string }) => {
        url: string;
        token: "abc123";
      }>
    >();
    expectTypeOf<AddUserHook>().toEqualTypeOf<
      Hook<"add-user", (arg: {
        url: string;
        token: "abc123";
      }) => {
        userId: 42;
        url: string;
        token: "abc123";
      }>
    >();

  });

  it("exports the default hooks alias", () => {
    expectTypeOf<HooksDefault>().toEqualTypeOf<Hooks<Hook<string, (arg: any) => unknown>[]>>();
  });
});
