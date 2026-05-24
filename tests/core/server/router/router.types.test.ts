import { Optionable, type TypeMarker } from "@blazyts/better-standard-library";

import { describe, expectTypeOf, it } from "vitest";

import type { Hook, IRouteHandler, RouteMatcher } from "../../../../index";

import { Hooks, RouterObject } from "../../../../index";
import { MockRouteHandler } from "../../../mocks/MockRouteHandler";

class NormalRouting<T extends string> implements RouteMatcher<{ postId: string }> {
  type = "normal";

  constructor(private routeString: T) { }

  getRouteString() {
    return this.routeString;
  }

  TGetRouteString: T;

  typeInfo: TypeMarker<"normal">;

  match(path: string): Optionable<{ postId: string }> {
    return Optionable.some((() => {
      const pattern = this.routeString.replace(/:(\w+)/g, "([^/]+)");
      const regex = new RegExp(`^${pattern}$`);
      const match = path.match(regex);

      if (match) {
        return { postId: match[1] };
      }
      return undefined;
    })());
  }

  TGetContextType: { postId: string };
}

describe("router type tests", () => {
  it("preserves route matcher literal and match result types", () => {
    const routeMatcher = new NormalRouting("/posts/:postId");
    const matchResult = routeMatcher.match("/posts/123");

    expectTypeOf(matchResult).toEqualTypeOf<Optionable<{ postId: string }>>();
    expectTypeOf(routeMatcher.TGetRouteString).toEqualTypeOf<"/posts/:postId">();
    expectTypeOf(routeMatcher.TGetContextType).toEqualTypeOf<{ postId: string }>();
  });

  it("tracks hook names and last return type through Hooks.add", () => {
    const hooks = Hooks
      .empty()
      .add({
        name: "add-token",
        handler: (arg: { url: string }) => ({ ...arg, token: "abc123" }),
      })
      .add({
        name: "add-user",
        handler: arg => ({ ...arg, userId: 42 }),
      });

    expectTypeOf(hooks.TGetHookNames).toEqualTypeOf<"add-token" | "add-user">();
    expectTypeOf(hooks.TGetLastHookReturnType).toEqualTypeOf<{
      url: string;
      token: string;
      userId: number;
    }>();
    expectTypeOf(hooks.TGetLastHook).toEqualTypeOf<Hook<"add-user", (arg: {
      url: string;
      token: string;
    }) => {
      url: string;
      token: string;
      userId: number;
    }>>();
  });

  it("threads route params and hook output into the handler request type", () => {
    let requestArg: unknown;
    let afterHandlerArg: unknown;
    let onErrorArg: unknown;

    const router = RouterObject
      .empty()
      .beforeHandler({
        name: "add-token",
        handler: (arg) => {
          expectTypeOf(arg).toMatchTypeOf<{ reqData: { url: string } }>();
          return { ...arg, token: "abc123" as const };
        },
      })
      .beforeHandler({
        name: "add-user",
        handler: (arg) => {
          expectTypeOf(arg).toEqualTypeOf<{
            reqData: {
              url: string;
              headers: unknown;
              body: unknown;
              protocol?: string;
            };
            token: "abc123";
          }>();
          return { ...arg, userId: 42 as const, userName: "testuser" as const };
        },
      })
      .addRoute({
        routeMatcher: new NormalRouting("/posts/:postId"),
        protocol: "GET",
        hooks: {},
        handler: new MockRouteHandler((req) => {
          requestArg = req;
          return {
            body: {
              success: true as const,
              postId: req.body.postId,
              token: req.body.token,
              userId: req.body.userId,
              userName: req.body.userName,
            },
          };
        }),
      })
      .afterHandler("add-timestamp", (response) => {
        afterHandlerArg = response;
        return { ...response, timestamp: Date.now() };
      })
      .onError({
        name: "format-error",
        handler: (error) => {
          onErrorArg = error;
          return { errorCode: "ERR_500" as const };
        },
      });

    expectTypeOf(requestArg).toMatchTypeOf<{
      body: {
        postId: string;
        token: "abc123";
        userId: 42;
        userName: "testuser";
      };
    }>();

    expectTypeOf(afterHandlerArg).toMatchTypeOf<{
      body: {
        success: true;
        postId: string;
        token: "abc123";
        userId: 42;
        userName: "testuser";
      };
    }>();

    expectTypeOf(onErrorArg).toMatchTypeOf<unknown>();

    expectTypeOf(router.routes).toMatchTypeOf<{
      posts: {
        ":postId": {
          "/": {
            GET: IRouteHandler<
              {
                body: {
                  postId: string;
                  token: "abc123";
                  userId: 42;
                  userName: "testuser";
                };
              },
              {
                body: {
                  success: true;
                  postId: string;
                  token: "abc123";
                  userId: 42;
                  userName: "testuser";
                };
              }
            >;
          };
        };
      };
    }>();
  });
});
