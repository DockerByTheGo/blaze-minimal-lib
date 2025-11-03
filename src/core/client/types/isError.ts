import { Range400to499 } from "./client";


export type isError<T extends number> = T extends Range400to499 ? true : false;
