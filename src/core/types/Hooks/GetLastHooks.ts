import { LastOf } from "bun-types/vendor/expect-type";
import { Hooks } from "./Hooks";

export type GetLastHookReturnType<T extends Hooks> = ReturnType<LastOf<T>>