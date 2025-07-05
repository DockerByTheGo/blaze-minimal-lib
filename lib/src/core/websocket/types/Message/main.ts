import type { Last, NeverWithDefault } from "@blazyts/better-standard-library";
import type { ZodObject, ZodRawShape } from "zod";

import type { BaseHookBundle, Hook, HookOrderedRecordBase, MessageHooks } from "../Hooks/main";

export type TypedMessage<ChannelNames extends string, Payload> = {
    channel: ChannelNames;
    message: string;
    payload: Payload;
};

export type Handler<Context, ReturnType> = (context: Context) => ReturnType;

export type MessageHandler<
    HandlerReturnType,
    Hooks extends MessageHooks<
        Hook<unknown, HookOrderedRecordBase>,
        Hook<unknown, HookOrderedRecordBase>
    >,
> = {
    hooks: Hooks;
    handler: Handler<
        NeverWithDefault<
            ReturnType<Last<Hooks["beforeHandler"]["ordered"]["elements"]["value"]>["execute"]>,
            { default: string }
        >,
        HandlerReturnType
    >; // if nothing is return from a handler its simpley that after hooks wont be ran
};

export type MessagesEntries<MessagesItCanSend extends string, MessagesItCanReceive extends string> = {
    messagesItCanSend: MessagesItCanSend;
    messagesItCanReceive: MessagesItCanReceive;
};

export type MessageThatCanBeSent<Schema extends ZodObject<ZodRawShape>> = Schema;

export type MessageItCanReceive<
    Hooks extends MessageHooks<BaseHookBundle, BaseHookBundle>,
    ReturnType,
> = {
    config: MessageHandler<ReturnType, Hooks>;
};
