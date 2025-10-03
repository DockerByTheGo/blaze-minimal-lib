export class Config {
    constructor(public properties: {
        MaxHookHandlerTime?: number;
        MaxRouteHandlerExecutionTime?: number;
    }) {}
}