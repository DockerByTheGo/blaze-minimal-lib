export class Hook<
  TName extends string,
  THandler extends (arg: any) => unknown
> {
  constructor(public name: TName, public handler: THandler) { }

  TGetArgType!: Parameters<THandler>[0];
  TGetReturnType!: ReturnType<THandler>;
}
