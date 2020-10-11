import { promiseSerial } from "../utils";

const sleep = (timeout: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};
const sleepError = (timeout: number): Promise<void> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error("test"));
    }, timeout);
  });
};
test("promiseSerial", async () => {
  const promises = [
    sleep.bind(null, 50),
    sleepError.bind(null, 50),
    sleep.bind(null, 50),
  ];
  const results = await promiseSerial(promises);

  expect(results[1].status).toBe("rejected");
});
