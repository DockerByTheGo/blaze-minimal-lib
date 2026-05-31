import type { Last, URecord } from "@blazyts/better-standard-library";

import { panicTypeOnlyVariable, TypeMarker } from "@blazyts/better-standard-library";
import { Hook } from "./Hook";

type AnyHook = Hook<string, (arg: any) => unknown>;
type LastHookReturn<THooks extends AnyHook[]> = THooks extends [...AnyHook[], infer TLast]
  ? TLast extends Hook<string, infer THandler>
    ? ReturnType<THandler>
    : { url: string }
  : { url: string };

export class Hooks<
  THooks extends AnyHook[],
  VLastHookReturnType = LastHookReturn<THooks>,
> extends TypeMarker<"Hooks"> {
  protected constructor(public v: THooks) {
    super("Hooks");
  }

  execute(initialValue: URecord): VLastHookReturnType {
    return this.v.reduce<unknown>((acc, hook) => { return hook.handler(acc); }, initialValue) as VLastHookReturnType;
  }

  TGetLastHookReturnType!: VLastHookReturnType;

  TGetLastHook!: Last<THooks>;

  TGetHookByName<THookName extends THooks[number]["name"]>(): Extract<THooks[number], { name: THookName }> {
    return panicTypeOnlyVariable();
  }

  TGetHookNames!: THooks[number]["name"];

  add<
    THookName extends string,
    THookHandler extends (v: VLastHookReturnType) => unknown,
  >(v: {
    name: THookName;
    handler: THookHandler;
  },
  ): Hooks<[...THooks, Hook<THookName, THookHandler>], ReturnType<THookHandler>> {
    this.v.push(
      new Hook(v.name, v.handler) as AnyHook,
    );

    return this as any;
  }

  static new(): Hooks<AnyHook[], any> {
    return new Hooks([] as AnyHook[]);
  }

  static empty(): Hooks<[], { url: string }> {
    return new Hooks([] as const);
  }

  static from<THooks extends AnyHook[], VLastHookReturnType>(v: Hooks<THooks, VLastHookReturnType>): Hooks<THooks, VLastHookReturnType> {
    return new Hooks(v.v);
  }
}
