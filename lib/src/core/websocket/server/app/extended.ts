import { FirstArg, IPipeable } from '@blazyts/better-standard-library';
import { IMapable, ISimpleMapable } from "@blazyts/better-standard-library";
import { CustomWebSocketRouter } from "./index";
import { z, ZodObject, ZodRawShape } from 'zod';
import { First, map, Optionable, OrderedRecord, TrueMap } from '@blazyts/better-standard-library';
import { HookBuilder } from '../utilites/builders/HookBuilder';
import { ChannelBuilder } from '../utilites/builders/ChannekBuilder';
import { ChannelConfig } from '../../types/Channel/main';
import { BaseHookBundle, BaseMessageHooks, GlobalHooks, HookOrderedRecord, ServerHooks } from '../../types/Hooks/main';
import { Context } from 'vitest';
import { MessageItCanReceive, MessageThatCanBeSent } from '../../types/Message/main';



type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
  };
  
  function deepFreeze<T>(obj: T): DeepReadonly<T> {
    Object.getOwnPropertyNames(obj).forEach((prop) => {
      const value = (obj as any)[prop];
      if (value && typeof value === 'object') {
        deepFreeze(value);
      }
    });
    return Object.freeze(obj) as DeepReadonly<T>;
  }
  


export class Extended<
  Channels extends Record<
    string,
    ChannelConfig<
      Record<string, MessageThatCanBeSent<ZodObject<ZodRawShape>>>,
      Record<string, MessageItCanReceive<BaseMessageHooks, unknown>>,
      Partial<ServerHooks<BaseHookBundle, BaseHookBundle, string>>
    >
  >,
  Hooks extends GlobalHooks,
> extends CustomWebSocketRouter<
Channels,
Hooks
  > implements
    ISimpleMapable<
      CustomWebSocketRouter<Channels, Hooks>
    >,
    IPipeable<
      CustomWebSocketRouter<Channels, Hooks>
    >,
    IMapable<
      CustomWebSocketRouter<Channels, Hooks>,
      CustomWebSocketRouter<Channels, Hooks>
    >{
  constructor(channels: Channels) {
    super(channels);
    // You can now do custom things with `this.channels` or `this.context`
  }

  // Example of an additional method

  get definition(): AsyncAPIDocument {
    return this.channels;
  }

  guard<NewHookName extends string>(config: { schema: ZodObject<ZodRawShape>, name: NewHookName, type: string }) {
    return map(config,({ name, type, schema }) =>

      this.hook({
        name,
        type,
        handler: (ctx) => {
          const passthroughSchema = schema.passthrough();
          const result = passthroughSchema.safeParse(ctx);

          if (!result.success) {
            throw result.error;
          }

          return ctx as z.infer<typeof schema>;

        }
      }) // todo make it so that each of these hooks wrapper can be put on  each level, onError beforeHandle afterHandle etc...
    )
  }

  match<NewHookName extends string>(config: { schema: ZodObject<ZodRawShape>, name: NewHookName, type: string }) {
    return map(config,({ name, type, schema }) =>

      this.hook({
        name,
        type,
        handler: (ctx) => {
          const passthroughSchema = schema.strict();
          const result = passthroughSchema.safeParse(ctx);

          if (!result.success) {
            throw result.error;
          }

          return ctx as z.infer<typeof schema>;

        }
      }) // todo make it so that each of these hooks wrapper can be put on  each level, onError beforeHandle afterHandle etc...
    )
  }


  imutify<NewHooksName extends string>() {
    return this.hook({
        name,
        type,
        handler: (ctx) => {
           return deepFreeze(ctx) 
        }
    })
  }

}

export class BuilderEnhanced<
    Channels extends Record<
        string,
        ChannelConfig<infer T>
    >,
    Context extends Record<string, unknown>,
    BeforeHooks extends OrderedRecord<>,
    LastHookReturnType extends Record<string, unknown> = {
        headers: { [x: string]: Optionable<string> };
    },
    LastHook extends (v: unknown) => LastHookReturnType = (v: {
        headers: { [x: string]: Optionable<string> };
    }) => LastHookReturnType,
    BaseRequest = {}
> extends Extended<

    Channels,
    Context,
    BeforeHooks,
    LastHookReturnType
,
LastHook ,
    BaseRequest
>{
  constructor() {
    super()
  }
  createHookBuilder(type: "before"): HookBuilder<>{ // so that we can pass the approppriate existing context inestead iod you needing to pass it on your own
    return new HookBuilder(this.hooks[type])
  }

  createChannelBuilder<NewChannelName extends string>(channelName: NewChannelName): NewChannelName extends ChannelNames ? never : ChannelBuilder<>{} // the same logic behind it as HookBuilder

function hook<
  HookType extends "beforeHandle",
  NewHooks extends HookOrderedRecord<[{ key: string; execute: (ctx: string /* get the return type of the last hook */) => unknown }, ...any[]]>
>(
  hooks: NewHooks
): FirstArg<NewHooks["elements"]["value"][0]["execute"]> {

}

}
