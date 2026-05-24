import { describe, expect, it } from "vitest";

import { Hook, Hooks } from "../../../src/core/hooks";

describe("Hook", () => {
  it("stores the hook name and handler", () => {
    const handler = (arg: { url: string }) => ({ ...arg, touched: true });
    const hook = new Hook("touch", handler);

    expect(hook.name).toBe("touch");
    expect(hook.handler).toBe(handler);
    expect(hook.handler({ url: "/posts" })).toEqual({
      url: "/posts",
      touched: true,
    });
  });
});

describe("Hooks", () => {
  it("executes hooks in insertion order and returns the final value", () => {
    const calls: string[] = [];

    const hooks = Hooks
      .empty()
      .add({
        name: "add-token",
        handler: (arg: { url: string }) => {
          calls.push("add-token");
          return { ...arg, token: "abc123" };
        },
      })
      .add({
        name: "add-user",
        handler: (arg) => {
          calls.push("add-user");
          return { ...arg, userId: 42 };
        },
      });

    expect(hooks.execute({ url: "/posts" })).toEqual({
      url: "/posts",
      token: "abc123",
      userId: 42,
    });
    expect(calls).toEqual(["add-token", "add-user"]);
  });

  it("returns the initial value when the chain is empty", () => {
    const initialValue = { url: "/health", headers: { accept: "json" } };

    expect(Hooks.empty().execute(initialValue)).toBe(initialValue);
    expect(Hooks.new().execute(initialValue)).toBe(initialValue);
  });

  it("creates a new hooks wrapper from an existing hooks instance", () => {
    const source = Hooks
      .empty()
      .add({
        name: "add-token",
        handler: (arg: { url: string }) => ({ ...arg, token: "abc123" }),
      });

    const clone = Hooks.from(source);

    expect(clone).not.toBe(source);
    expect(clone.v).toBe(source.v);
    expect(clone.execute({ url: "/posts" })).toEqual({
      url: "/posts",
      token: "abc123",
    });
  });

  it("mutates and returns the same hooks instance when adding hooks", () => {
    const hooks = Hooks.empty();
    const updated = hooks.add({
      name: "add-token",
      handler: (arg: { url: string }) => ({ ...arg, token: "abc123" }),
    });

    expect(updated).toBe(hooks);
    expect(updated.v).toHaveLength(1);
    expect(updated.v[0]?.name).toBe("add-token");
  });
});
