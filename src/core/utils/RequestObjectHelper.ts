import type { URecord } from "@blazyts/better-standard-library";

import { Path } from "../server/router/utils/path/Path";

// here we are doing transformation on demand so that we wrap the core object around this helers inly when needed to not hurt performace

export class RequestObjectHelper<
  TBodySchema extends URecord,
  THeaders extends URecord,
  TPath extends string,
> {
  constructor(
    public readonly properties: {
      body: TBodySchema;
      headers: THeaders;
      path: TPath
    },
  ) {

  }

  get body(): TBodySchema & {
    getUnsafe: <T = unknown>(property: string) => T;
    safeAccess: TBodySchema;
  } {
    return {
      ...this.properties,
      getUnsafe: (property: string) => {
        return this.properties.body[property];
      },
    };
  }

  public get path(): Path<TPath> {
    return new Path(this.properties.path)
  }

  public createMutableCopy(): {
    body: TBodySchema;
    headers: THeaders;
    path: TPath;
  } {
    return {
      body: { ...this.properties.body },
      headers: { ...this.properties.headers },
      path: this.properties.path,
    };
  }
}
