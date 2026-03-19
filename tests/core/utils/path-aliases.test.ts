import { describe, expect, it } from "bun:test";
import { Path } from "@src/core/server";
import { aliasFixture } from "@test/helpers/aliasFixture";
import { MockRouteHandler } from "@test/mocks/MockRouteHandler";

describe("path aliases", () => {
  it("resolves @src and @test in blaze-minimal-lib", () => {
    const path = new Path("/users/42");
    expect(path.parts).toHaveLength(2);
    expect(aliasFixture).toBe("blaze-minimal-lib-alias-ok");
    expect(new MockRouteHandler()).toBeDefined();
  });
});
