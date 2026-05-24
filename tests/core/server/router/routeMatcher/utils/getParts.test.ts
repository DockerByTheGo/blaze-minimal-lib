import { describe, expect, it } from "vitest";

import { getParts } from "../../../../../../src/core/server/router/routeMatcher/utils";

describe("getParts", () => {
  it("should split a standard path into parts", () => {
    expect(getParts("/api/users/:id")).toEqual(["api", "users", ":id"]);
  });

  it("should filter out empty segments created by repeated slashes", () => {
    expect(getParts("/api//users///profile")).toEqual(["api", "users", "profile"]);
  });

  it("should return an empty array for the root path", () => {
    expect(getParts("/")).toEqual([]);
  });

  it("should support paths without a leading slash", () => {
    expect(getParts("api/users")).toEqual(["api", "users"]);
  });
});
