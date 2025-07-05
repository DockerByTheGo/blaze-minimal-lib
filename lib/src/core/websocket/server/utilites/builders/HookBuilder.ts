import type { Last } from "@blazyts/better-standard-library";
import type { z, ZodObject, ZodRawShape } from "zod";

import { OrderedRecord } from "@blazyts/better-standard-library";

import type { GlobalHooks, HookDefaults, HookOrderedRecord, HookOrderedRecordEntry } from "../../../types/Hooks/main";
import type { Handler } from "../../../types/Message/main";

type WithDefault<Default, Type> = [Type] extends [never] ? Default : Type;

type g = WithDefault<{}, never>;

// type provideContextToHookDefault<T extends Record<string, unknown>> =

// ! this test must pass
type j = keyof HookDefaults;

export class HookBuilder<
    /* this will be passed from the app so no deafult here remove it after done with testing purposes */ Elements extends HookOrderedRecordEntry[],
    HookType extends keyof GlobalHooks,
> {
    public _elements: HookOrderedRecord<Elements>;
    protected type: HookType;
    constructor(elements: Elements = [] as const, type: HookType) {
    // so that we can only access it from within the class only since i dont want to expose it to the user
        this._elements = new OrderedRecord<Elements, HookOrderedRecordEntry>(
            elements,
        );
        this.type = type;
    }

    add<Return, HookName extends string>(handler: {
        key: HookName;
        execute: Handler<
            WithDefault<HookDefaults[HookType], ReturnType<Last<Elements>["execute"]>>,
            Return
        >;
    }): HookBuilder<[...Elements, typeof handler], HookType> {
        return new HookBuilder([...this._elements.elements.value, handler], this.type);
    }

    static new<HookType extends keyof GlobalHooks>(type: HookType): HookBuilder<[], HookType> { // e.g. empty
        return new HookBuilder([] as const, type);
    }

    build() {
        return this._elements;
    }

    guard<
        Guard extends ZodObject<ZodRawShape>,
        Key extends string,
    >(
        t: Guard,
        key: Key,
    ): HookBuilder<[...Elements, { key: Key; execute: Handler<HookDefaults[HookType], z.infer<Guard>> }], HookType> {
        return this.add({
            key,
            execute: (v) => {
                console.log("loko", t.shape, v);
                return {
                    original: v,
                    msg: t.parse(v),
                };
            },
        });
    }
}

// Note when making a hook builder for the inference and type retaining to work you must provide an arg in the cinstrcutor if you are gonna use it directly as in this example although a simple `([] as const)` will work as good
