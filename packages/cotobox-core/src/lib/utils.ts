// Horrific idea, don't use it unless you know what you're doing
export function waitForPromise<T>(promise: Promise<T>, error?: typeof Error): T {
    const errorType = (typeof error !== "undefined") ? error : Error;
    let result: T | undefined = undefined;

    promise.then(
        res => {result = res},
        reason => {throw new errorType(reason)}
    )

    while (result == undefined);
    return result
}
