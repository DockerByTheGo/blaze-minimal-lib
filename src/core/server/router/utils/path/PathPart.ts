export class PathPart<T extends string> {
  constructor(public readonly part: T) { }

  isDynamic(): boolean {
    return this.part[0] === ":";
  }
}
