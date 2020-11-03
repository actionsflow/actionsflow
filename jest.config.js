// eslint-disable-next-line @typescript-eslint/no-var-requires
const glob = require(`glob`);

const pkgs = glob
  .sync(`./packages/*`)
  .map((p) => p.replace(/^\./, `<rootDir>`));
const ignoreDistPkgs = glob
  .sync(`./packages/*/dist`)
  .map((p) => p.replace(/^\./, `<rootDir>`));
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: pkgs,
  modulePathIgnorePatterns: ignoreDistPkgs,
  testPathIgnorePatterns: [`__tests__/fixtures`, ".util.ts"],
  verbose: true,
  testTimeout: 10000,
  setupFiles: ["dotenv/config"],
  collectCoverage: true,
  coverageReporters: ["html", "lcov"],
};
