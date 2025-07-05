import type { AfterfixKeysOfRecord } from "@blazyts/better-standard-library";
import type { IncomingMessage } from "node:http";

import { OrderedRecord } from "@blazyts/better-standard-library";

import type { TypeSafeWebsocket, WithKey } from "../main";
import type { Handler, TypedMessage } from "../Message/main";

export type HookOrderedRecordEntry<T = unknown, U = unknown> = WithKey<{
    execute: Handler<T, U>;
}>;

export class HookOrderedRecord<
    Elements extends HookOrderedRecordEntry[],
> extends OrderedRecord<Elements, HookOrderedRecordEntry> {}

{ // declaring new scope so that we can reuse names in the kater examples without the compiler being a bitch
    const hooks = new HookOrderedRecord([{ key: "first", execute: () => { } }] as const).add({ key: "d", execute: () => 23 } as const);
    { // again to introduce it in a new scope so that i can later reuse these burner names
        const g = hooks.elements.value[0];
    // should be
    // const g: {
    //     readonly key: "first";
    //     readonly execute: () => void;
    // }
    }

    {
        const g = hooks.elements.value[1];
    //     should be const g: {
    //     readonly key: "first";
    //     readonly execute: () => void;
    // }
    }
}

export type BaseHookBundle = Hook<unknown, HookOrderedRecordBase>;

export type Hook<EnteringContext, Mappers extends HookOrderedRecordBase> = {
    ordered: Mappers;
    independent: IndependentHandler<EnteringContext>[];
};

export type GlobalOnlyHooks<
    OnCloseHooks extends HookOrderedRecordBase,
    OnConnectionHooke extends HookOrderedRecordBase,
> = {
    onClose: Hook<{ code: number; reason: string }, OnCloseHooks>;
    onConnection: Hook<IncomingMessage, OnConnectionHooke>;
};

export type ServerHooks<
    BeforeHandle extends Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>,
    AfterHandle extends Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>,
    Errors extends string = string,
> = {
    beforeHandle: BeforeHandle;
    afterHandle: AfterHandle;
    onError: (error: Errors) => void;
};

export type GlobalHooks =
    GlobalOnlyHooks<
        HookOrderedRecordBase,
        HookOrderedRecordBase
    >
    & ServerHooks<
        BaseHookBundle,
        BaseHookBundle
    >;

export type MessageHooks<
    Before extends BaseHookBundle,
    After extends BaseHookBundle,
> = AfterfixKeysOfRecord<ServerHooks<
    Before,
    After
>, "r">;

type HookHandler<
    ReturnType,
    MessageType,
> = (ctx: {
    ws: WebSocket;
    message: MessageType;
}) => ReturnType;

type IndependentHandler<MessageType> = HookHandler<Promise<void>, MessageType>;

export type HookOrderedRecordBase = HookOrderedRecord<HookOrderedRecordEntry[]>;

export type HookTypes = {
    MessageOnlyHooks: keyof MessageHooks<BaseHookBundle, BaseHookBundle>;
    ServerHooks: keyof GlobalHooks;
};

export type BaseMessageHooks = MessageHooks<BaseHookBundle, BaseHookBundle>;
export type HookDefaults = {
    onConnection: { ws: TypeSafeWebsocket };
    onClose: {};
    beforeHandle: { ws: TypeSafeWebsocket };
    afterHandle: { ws: TypeSafeWebsocket };
    beforeHandler: { ws: TypeSafeWebsocket };
    afterHandler: { ws: TypeSafeWebsocket };
    onError: { error: Error };
    onErrorr: { error: Error }; // his is the lcoal onError handler
};
