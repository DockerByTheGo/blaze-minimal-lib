import { describe, expect, it } from "vitest";

import { PathPart } from "../../../../../../src/core/server/router/utils/path/PathPart";

describe("PathPart", () => {
  it("should store the provided path segment", () => {
    const part = new PathPart("users");

    expect(part.part).toBe("users");
  });

  it("should identify dynamic segments", () => {
    const part = new PathPart(":id");

    expect(part.isDynamic()).toBe(true);
  });

  it("should identify static segments", () => {
    const part = new PathPart("users");

    expect(part.isDynamic()).toBe(false);
  });
});
