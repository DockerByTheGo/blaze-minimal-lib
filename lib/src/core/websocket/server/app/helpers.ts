import { TrueMap } from "@blazyts/better-standard-library";

import type { Hook, HookOrderedRecordBase } from "../../types/Hooks/main";

export function runOrderedHooks<T>(
    ordered: { execute: (arg: T) => T }[],
    initial: T,
): T {
    if (!ordered.length)
        return initial;

    return ordered.slice(1).reduce(
        (acc, fn) => fn.execute(acc),
        ordered[0].execute(initial),
    );
}

export function runHookHandler<HookToBeRun extends Hook<unknown, HookOrderedRecordBase>>({ ordered, independent }: HookToBeRun, arrivingContext: {}) {
    independent.forEach(handler => handler(arrivingContext));

    return TrueMap.new(runOrderedHooks(ordered.elements.value, arrivingContext));
}

export function runMessageHandler({ handler, hooks, context }) {
    // Run beforeHandler
    runHookHandler(hooks.beforeHandler, context);

    // Run the main handler
    const result = handler(context);

    // Run afterHandler
    runHookHandler(hooks.afterHandler, { ...context, result });

    return result;
}
