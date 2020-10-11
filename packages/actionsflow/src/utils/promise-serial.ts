interface IPromiseFunc<T> {
  (): Promise<T>;
}
export async function promiseSerial<T>(
  promises: IPromiseFunc<T>[]
): Promise<PromiseSettledResult<T>[]> {
  const defaultResults: PromiseSettledResult<T>[] = [];
  return promises.reduce((promise, func) => {
    return promise.then((result) => {
      return func()
        .then((funcResult) => {
          return result.concat({
            status: "fulfilled",
            value: funcResult,
          });
        })
        .catch((e) => {
          return result.concat({
            status: "rejected",
            reason: e,
          });
        });
    });
  }, Promise.resolve(defaultResults));
}
