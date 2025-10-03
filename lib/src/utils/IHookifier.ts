import { URecord } from "@blazyts/better-standard-library/src/type-level-functions";

type IsFunction<T> = T extends Function ? true : false;

export class Pipefied<T>{}

export type HookifyReturn<T extends URecord> = {
    [Key in keyof T]: IsFunction<T[Key]> extends true 
    ? HookifiedMethod<T[Key]> 
    : HookifiedProperty<T[Key]>
    }

type HookifiedProperty<T> = {
    onAccessed: (v: T) => unknown,
    onChanged: (newV: T) => unknown,
    access: () => T
}


class HookifiedMethod<T extends Function>{
    public before(func: (v: unknown) => unknown) {
        this.befores.push(func)
    }
    public after(func: (v: unknown) => unknown) {
        this.afters.push(func)
    }
    public invoke: T
    constructor(func : T){
        this.invoke = (v) => {
            this.befores.forEach((before) => {
                before(v)
            })
            let result = func(v)
            this.afters.forEach((after) => {
                after(result)
            })
            return result
        }

    }
    
    protected befores: ((v: unknown) => unknown)[] = []
    protected afters: ((v: unknown) => unknown)[] = []

}

export function hookify<
T extends Record<string, unknown>
> (
    object: T
): HookifyReturn<T>{
    let obj: HookifyReturn<T> = {} as HookifyReturn<T>
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            if(typeof object[key] === "function"){
                const entry: HookifiedMethod<unknown> = {}
               
                entry.before = 
                
                
                obj[key] = {
                    before: () => {},
                    invoke: object[key],
                    after: () => {},
                }
            }else {
                obj[key] = {
                    onAccessed: () => {},
                    access: () => {},
                    onChanged: () => {},
                }
            }
        }
    }
    return obj
}



hookify({
    koko: (v: string) => ""
})