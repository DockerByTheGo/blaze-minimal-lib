import type { URecord } from "@blazyts/better-standard-library";

import type { IRouteHandler } from "../types";

export class NormalRouteHandler<
  TCtx extends { body: URecord },
  TReturn extends { body: URecord },
> implements IRouteHandler<
  TCtx,
  TReturn
> {
  constructor(
    public handleRequest: (arg: TCtx) => TReturn,
  ) { }
}
