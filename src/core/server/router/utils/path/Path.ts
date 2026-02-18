import { Optionable } from "@blazyts/better-standard-library/src/data_structures/functional-patterns/option";

import { PathPart } from "./PathPart";

type FindLastPathPartReturnType<T extends string> = T extends [...infer Rest, `/`, infer LastPart]
  ? LastPart
  : T extends [...infer Rest, "/"]
  ? "/"
  : T;

export class Path<T extends string> {
  constructor(public readonly path: T) { }

  public get parts(): PathPart<string>[] {
    let url: string = null
    if (this.path.includes("://")) {
      const urlWithoutProtocol = this.path.slice(this.path.indexOf("//") + 2)
      const urlWithoutHost = urlWithoutProtocol.slice(urlWithoutProtocol.indexOf("/"))
      url = urlWithoutHost
    } else {
      url = this.path
    }
    return url
      .split("/")
      .filter(v => v.length > 0)
      .map(part => new PathPart(part));
  }

  getLastPart(): Optionable<PathPart<FindLastPathPartReturnType<T>>> { // todo add intellisense in the future
    const res = (_ => {
      const parts = this.parts;
      if (parts.length === 0)
        return null;
      return parts[parts.length - 1];
    })()
    return Optionable.some(res);
  }
}
