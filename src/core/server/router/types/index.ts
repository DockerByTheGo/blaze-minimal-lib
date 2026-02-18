import { URecord } from "@blazyts/better-standard-library";
import type { Hook, Hooks, HooksDefault } from "../../../types/Hooks/Hooks";
import type { IRouteHandler, Request, Response } from "../routeHandler";
export * from "./PathStringToObject"
export type RouteTree = {
  [segment: string]: RouteTree | { "/": IRouteHandler<Request, Response> } | IRouteHandler<Request, Response>;
};

export type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
  beforeHandler: (arg: ReturnType<TRouterHooks["beforeHandler"]["TGetLastHookReturnType"]["handler"]>) => URecord;
  afterHandler: (arg: ReturnType<TRouterHooks["afterHandler"]["TGetLastHookReturnType"]["handler"]>) => URecord;
  onError: (arg: ReturnType<TRouterHooks["onError"]["TGetLastHookReturnType"]["handler"]>) => URecord
};

export type RouterHooks = {
  beforeHandler: HooksDefault;
  afterHandler: HooksDefault;
  onError: HooksDefault;
  onStartup: HooksDefault;
  onShutdown: HooksDefault;
};


