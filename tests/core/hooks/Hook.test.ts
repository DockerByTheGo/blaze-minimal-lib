import { describe, expect, it } from "vitest";

import { Hook } from "../../../src/core/hooks";

describe("Hook", () => {
  it("stores the hook name and handler", () => {
    const handler = (arg: { url: string }) => ({ ...arg, touched: true });
    const hook = new Hook("touch", handler);

    expect(hook.handler({ url: "/posts" })).toEqual({
      url: "/posts",
      touched: true,
    });
  });
});
