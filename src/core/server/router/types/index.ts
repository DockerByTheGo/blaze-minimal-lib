import type { URecord } from "@blazyts/better-standard-library";

import type { HooksDefault } from "@src/core/hooks/types/HooksDefault";
import type { IRouteHandler, Request, Response } from "../routeHandler";

export * from "./PathStringToObject";

export type ProtocolHandlers = {
  [protocol: string]: IRouteHandler<Request, Response>;
};

export type RouteTree = {
  [segment: string]: RouteTree | { "/": ProtocolHandlers } | IRouteHandler<Request, Response>;
};

export type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
  beforeHandler: (arg: ReturnType<TRouterHooks["beforeHandler"]["TGetLastHookReturnType"]["handler"]>) => URecord;
  afterHandler: (arg: ReturnType<TRouterHooks["afterHandler"]["TGetLastHookReturnType"]["handler"]>) => URecord;
  onError: (arg: ReturnType<TRouterHooks["onError"]["TGetLastHookReturnType"]["handler"]>) => URecord;
};

export type RouterHooks = {
  beforeHandler: HooksDefault;
  afterHandler: HooksDefault;
  onError: HooksDefault;
  onStartup: HooksDefault;
  onShutdown: HooksDefault;
};
