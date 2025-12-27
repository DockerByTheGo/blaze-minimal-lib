import type { Hook, Hooks } from "../../../types/Hooks/Hooks";
import type { IRouteHandler, Request, Response } from "../routeHandler";

export type RouteTree = {
  [segment: string]: RouteTree | IRouteHandler<Request, Response>;
};

export type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
  beforeRequest: (arg: ReturnType<TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>;
  afterResponse: (arg: ReturnType<TRouterHooks["afterResponse"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>;
};

export type RouterHooks = {
  beforeRequest: Hooks<Hook<string, (arg: unknown) => unknown>[]>;
  afterResponse: Hooks<Hook<string, (arg: unknown) => unknown>[]>;
};
