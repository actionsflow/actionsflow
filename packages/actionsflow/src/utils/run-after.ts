interface IRunAfterFn<T> {
  (): Promise<T>;
}
export async function runAfter<T>(
  fn: IRunAfterFn<T>,
  timeout: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    if (timeout >= 0) {
      setTimeout(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      }, timeout);
    } else {
      // invalid
      reject(`Invalid timeout param: ${timeout}`);
    }
  });
}
