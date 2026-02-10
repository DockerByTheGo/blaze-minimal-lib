import type { Hook, Hooks } from "../../../types/Hooks/Hooks";
import type { IRouteHandler, Request, Response } from "../routeHandler";

export type RouteTree = {
  [segment: string]: RouteTree | IRouteHandler<Request, Response>;
};

export type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
  beforeHandler: (arg: ReturnType<TRouterHooks["beforeHandler"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>;
  afterHandler: (arg: ReturnType<TRouterHooks["afterHandler"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>;
};

export type RouterHooks = {
  beforeHandler: Hooks<Hook<string, (arg: unknown) => unknown>[]>;
  afterHandler: Hooks<Hook<string, (arg: unknown) => unknown>[]>;
};
