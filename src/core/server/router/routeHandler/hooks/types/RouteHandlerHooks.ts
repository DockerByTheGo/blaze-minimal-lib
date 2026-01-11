import { RouterHooks } from "../../../hooks/types/RouterHooks";

export type RouteHandlerHooks<TRouterHooks extends RouterHooks> = {
  beforeRequest: (arg: ReturnType<TRouterHooks["beforeRequest"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>;
  afterResponse: (arg: ReturnType<TRouterHooks["afterRequest"]["TGetLastHookReturnType"]["handler"]>) => Record<string, unknown>;
};