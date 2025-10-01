import { Hook } from "../../types/Hooks/Hooks";



export type ClientHooks = {
    beforeSend: Hook[];
    afterReceive: Hook[];
    onErrored: Hook[]; // a type of afterReceive
};

