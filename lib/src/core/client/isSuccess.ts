import { Range200to300 } from "./client";


export type isSuccess<T extends number> = T extends Range200to300 ? true : false;
