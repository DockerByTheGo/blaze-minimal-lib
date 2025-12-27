import type { URecord } from "@blazyts/better-standard-library";
import type { allStatusCodes, serverErrors } from "@blazyts/http-types";
import type { SuccessStatusCode } from "hono/utils/http-status";

import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";

export class ResponseHelper<
  TBody extends URecord,
  THeaders extends URecord,
  TStatus extends allStatusCodes,
> {
  constructor(
    public readonly body: TBody,
    public readonly headers: THeaders,
    public readonly status: TStatus,
  ) {

  }

  public isSuccesful(): TStatus extends SuccessStatusCode ? true : false {
    return (this.status >= 200 && this.status < 300) as TStatus extends SuccessStatusCode ? true : false;
  }

  public isError(): TStatus extends serverErrors ? true : false {
    return (this.status >= 400 && this.status < 500) as TStatus extends serverErrors ? true : false;
  }

  public try<TSuccessReturn, TErrorReturn>(config: {
    onSuccess: (response: ResponseHelper<TBody, THeaders, TStatus>) => TSuccessReturn;
    onError: (response: ResponseHelper<TBody, THeaders, TStatus>) => TErrorReturn;
  }): TSuccessReturn | TErrorReturn {
    if (this.isSuccesful()) {
      return config.onSuccess(this);
    }
    else {
      return config.onError(this);
    }
  }

  onSuccess<TSuccessReturn>(cb: (response: ResponseHelper<TBody, THeaders, TStatus>) => TSuccessReturn): Optionable<TSuccessReturn> {
    return new Optionable((() => {
      if (this.isSuccesful()) {
        return cb(this);
      }
      return null;
    })());
  }

  onError<TErrorReturn>(cb: (response: ResponseHelper<TBody, THeaders, TStatus>) => TErrorReturn): Optionable<TErrorReturn> {
    return new Optionable((() => {
      if (this.isError()) {
        return cb(this);
      }
      return null;
    })());
  }
}
