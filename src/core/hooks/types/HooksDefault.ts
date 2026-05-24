import type { Hook } from "../Hook";
import type { Hooks } from "../Hooks";


export type HooksDefault = Hooks<Hook<string, (arg: any) => unknown>[]>;
