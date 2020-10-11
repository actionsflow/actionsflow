import { getScheduler } from "../schedule";

test("get schedule", () => {
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = new Date(
    "2020-10-05T04:13:00.000Z"
  ).toISOString();
  const scheduler = getScheduler({ every: "*/10 * * * *", timeZone: "UTC" });
  expect(scheduler.prev).toBe(1601871000000);
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
});

test("get schedule specific time", () => {
  process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON = new Date(
    "2020-10-05T04:13:00.000Z"
  ).toISOString();
  const scheduler = getScheduler({ every: "10 10 * * *", timeZone: "UTC" });
  expect(scheduler.prev).toBe(1601806200000);
  delete process.env.ACTIONSFLOW_CURRENT_TIME_FOR_CRON;
});
