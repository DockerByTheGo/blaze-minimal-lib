import { describe, it, expect } from "vitest";
import { Path } from "../../../../../../src/core/server";

describe("Path", () => {
    describe("constructor", () => {
        it("should create a Path instance with a string", () => {
            const path = new Path("/api/users");
            expect(path.path).toBe("/api/users");
        });
    });

    describe("parts", () => {
        it("should parse a simple path into parts", () => {
            const path = new Path("/api/users");
            const parts = path.parts;

            expect(parts).toHaveLength(2);
            expect(parts[0].part).toBe("api");
            expect(parts[1].part).toBe("users");
        });

        it("should parse a path with dynamic segments", () => {
            const path = new Path("/api/users/:id");
            const parts = path.parts;

            expect(parts).toHaveLength(3);
            expect(parts[0].part).toBe("api");
            expect(parts[1].part).toBe("users");
            expect(parts[2].part).toBe(":id");
        });

        it("should handle root path correctly", () => {
            const path = new Path("/");
            const parts = path.parts;

            expect(parts).toHaveLength(0);
        });

        it("should filter out empty segments", () => {
            const path = new Path("/api//users///profile");
            const parts = path.parts;

            expect(parts).toHaveLength(3);
            expect(parts.map(p => p.part)).toEqual(["api", "users", "profile"]);
        });
    });

    describe("getLastPart", () => {
        it("should return the last part of a path", () => {
            const path = new Path("/api/users/profile");
            const lastPart = path.getLastPart();

            expect(lastPart.isSome()).toBe(true);
            expect(lastPart.unpack().valueOf().part).toBe("profile");
        });

        it("should return None for a root path", () => {
            const path = new Path("/");
            const lastPart = path.getLastPart();

            expect(lastPart.isNone()).toBe(true);
        });

        it("should handle single segment paths", () => {
            const path = new Path("/api");
            const lastPart = path.getLastPart();

            expect(lastPart.isSome()).toBe(true);
            expect(lastPart.unpack().valueOf().part).toBe("api");
        });

        it("should return last part with dynamic segments", () => {
            const path = new Path("/api/users/:id");
            const lastPart = path.getLastPart();

            expect(lastPart.isSome()).toBe(true);
            expect(lastPart.unpack().valueOf().part).toBe(":id");
            expect(lastPart.unpack().valueOf().isDynamic()).toBe(true)
        });
    });

    describe("integration", () => {
        it("should correctly parse complex paths", () => {
            const path = new Path("/api/v1/users/:userId/posts/:postId");
            const parts = path.parts;

            expect(parts).toHaveLength(6);
            expect(parts.map(p => p.part)).toEqual([
                "api",
                "v1",
                "users",
                ":userId",
                "posts",
                ":postId",
            ]);

            const lastPart = path.getLastPart();
            expect(lastPart.unpack().valueOf().part).toBe(":postId");
        });
    });
});
