import type { Last, URecord } from "@blazyts/better-standard-library";

import { TypeMarker } from "@blazyts/better-standard-library";

export class Hook<
  TName extends string,
  THandler extends (arg: unknown) => unknown,
> {
  constructor(public name: TName, public handler: THandler) { }

  TGetArgType: Parameters<THandler>[0];
  TGetReturnType: ReturnType<THandler>
}

type FindHookByName<
  THooks extends readonly Hook<string, any>[],
  TTargetName extends string,
> = THooks extends readonly [
  infer First extends Hook<string, any>,
  ...infer Rest extends readonly Hook<string, any>[],
]
  ? First["name"] extends TTargetName
  ? First
  : FindHookByName<Rest, TTargetName>
  : never;

type FindNextHookByName<
  THooks extends readonly Hook<string, any>[],
  TTargetName extends string,
  Found extends boolean = false,
>
  = THooks extends readonly [
    infer First extends Hook<string, any>,
    ...infer Rest extends readonly Hook<string, any>[],
  ]
  ? Found extends true
  ? First // <-- immediately return the next one
  : First["name"] extends TTargetName
  ? FindNextHookByName<Rest, TTargetName, true>
  : FindNextHookByName<Rest, TTargetName, false>
  : never;

export class Hooks<
  THooks extends (Hook<string, (arg: unknown) => unknown>)[],
  VLastHookReturnType extends {url: string} = ReturnType<Last<THooks>["handler"]>,
> extends TypeMarker<"Hooks"> {
  protected constructor(public v: THooks) {
    super("Hooks");
  }

  execute(initialValue: URecord): VLastHookReturnType {
    return this.v ? this.v.reduce((acc, hook) => { return hook.handler(acc) }, initialValue) as VLastHookReturnType : initialValue;
  }

  TGetLastHookReturnType: VLastHookReturnType;

  TGetLastHook: Last<THooks>;

  TGetHookByName<THookName extends THooks[number]["name"]>(): THookName extends THooks[number]["name"] ? THooks[number] : never {

  };

  TGetHookNames: THooks[number]["name"];

  placeBefore<
    TExistingHookName extends THooks[number]["name"],
    TNewHookName extends string,
  >(v: {
    existingHookName: TExistingHookName;
    newHook: {
      name: TNewHookName;
      handler: (arg: FindHookByName<THooks, TExistingHookName>["TGetArgType"]) => ReturnType<FindHookByName<THooks, TExistingHookName>["handler"]>;
    };
  },
  ): Hooks<THooks> {

  }

  add<
    THookName extends string,
    THookHandler extends (v: VLastHookReturnType extends unknown ? VLastHookReturnType : any) => unknown,
  >(v: {
    name: THookName;
    handler: THookHandler;
  },
  ): Hooks<[...THooks, Hook<THookName, THookHandler>]> {
    this.v.push(
      new Hook(v.name, v.handler),
    );

    return this as any
  }

  static new() {
    return new Hooks([] as Hook<string, (arg: unknown) => unknown>[]);
  }

  static empty(): Hooks<[]> {
    return new Hooks([] as const);
  }

  static from<T extends Hooks<Hook<string, (arg: unknown) => unknown>[]>>(v: T) {
    return new Hooks(v.v);
  }
}


export type HooksDefault = Hooks<Hook<string, (arg: unknown) => unknown>[]>

export type HookDfault = Hook<string, (arg: unknown) => unknown>

const h = Hooks
  .empty()
  .add({
    name: "idk" as const,
    handler: v => "gg" as const,
  })
  .add({
    name: "idk2" as const,
    handler: v => "ddd" as const,
  })
  .placeBefore({
    existingHookName: "idk",
    newHook: {
      name: "idk3" as const,
      handler: v => "gg" as const,
    },
  });
