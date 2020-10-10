interface IRunAfterFn<T> {
  (): Promise<T>;
}
export async function runAfter<T>(
  fn: IRunAfterFn<T>,
  delay: number
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    if (delay >= 0) {
      setTimeout(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      }, delay);
    } else {
      // invalid
      reject(`Invalid delay param: ${delay}`);
    }
  });
}
