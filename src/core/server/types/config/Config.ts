export class Config {
  constructor(args: {
    MaxHookHandlerTime?: number;
    MaxRouteHandlerExecutionTime?: number;
    autoPrefixPathName?: boolean; // e,g, if we give api as prefix, it will automatically add the missing "/"" when building the route tree
  }) {}
}
