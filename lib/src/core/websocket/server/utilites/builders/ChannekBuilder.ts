import type { OrderedRecord } from "@blazyts/better-standard-library";
import type { z, ZodObject, ZodRawShape } from "zod";

import type { ChannelConfig } from "../../../types/Channel/main";
import type { Hook, HookOrderedRecord, HookOrderedRecordBase, HookOrderedRecordEntry, ServerHooks } from "../../../types/Hooks/main";
import type { MessageItCanReceive, MessageThatCanBeSent, TypedMessage } from "../../../types/Message/main";
import type { HookBuilder } from "./HookBuilder";

export class ChannelBuilder<
    MessagesItCanSend extends Record<string, ZodObject<ZodRawShape>>,
    MessagesItCanReceive extends Record<
        string,
        MessageItCanReceive<HookOrderedRecord<
            HookOrderedRecordEntry[]
        >, ZodObject<ZodRawShape> >
    >,
    Hooks extends ServerHooks<
        Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>,
        Hook<TypedMessage<string, unknown>, HookOrderedRecordBase>
    >,
> {
    public _hooks: Hooks;
    public _messagesItCanSend: MessagesItCanSend;
    public _messagesItCanReceive: MessagesItCanReceive;

    public getMessagesItCanSend: {
        [Message in keyof MessagesItCanSend]: z.infer<MessagesItCanSend[Message]>
    };

    constructor(hooks: Hooks, messagesItCanSend: MessagesItCanSend, messagesItCanReceive: MessagesItCanReceive) {

    }

    createHookBuilder<Type extends "afterHandle" /* replace with the actual types */>(t: Type): HookBuilder<Hooks[Type]["ordered"]> {

    }

    hook(hook: OrderedRecord): ChannelBuilder<MessagesItCanSend, MessagesItCanReceive, {}> { }

    addSender<Name extends string, Schema extends ZodObject<ZodRawShape>>(
        config: { name: Name; schema: MessageThatCanBeSent<Schema> },
    ): Name extends MessagesItCanSend
            ? never
            : ChannelBuilder<
            MessagesItCanSend & Record<Name, Schema>,
                MessagesItCanReceive,
                Hooks
            > {
        return new ChannelBuilder(
            this._hooks,
            { ...this._messagesItCanSend, [config.name]: config.schema },
            this._messagesItCanReceive,
        );
    }

    addReceiver<
        Name extends string,
        Schema extends ZodObject<ZodRawShape>,
        Other extends MessageItCanReceive<HookOrderedRecordBase, Schema>,
    >(
        config: { name: Name } & Other,
    ): Name extends keyof MessagesItCanReceive

            ? never
            : ChannelBuilder<

                MessagesItCanSend,
                (
                MessagesItCanReceive
                &
                Record<Name, Omit<typeof config, "name">>
                ),
                Hooks
            > {
        return new ChannelBuilder(
            this._hooks,
            this._messagesItCanSend,
            { ...this._messagesItCanReceive, [config.name]: { ...config } },
        );
    }

    build(): ChannelConfig<
        MessagesItCanSend,
        MessagesItCanReceive,
        Hooks
    > {

    }
}
