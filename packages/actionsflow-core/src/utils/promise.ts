/**
 * Determine whether the given `promise` is a Promise.
 *
 * @param {*} promise
 *
 * @returns {Boolean}
 */
export function isPromise(promise: unknown): boolean {
  return !!promise && typeof (promise as Promise<string>).then === "function";
}
