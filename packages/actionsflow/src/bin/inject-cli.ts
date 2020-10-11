console.warn = function (...args: unknown[]) {
  // for warn message will be print to stderr, we don't want this happen.
  // because exec need to check is really error occured
  // eslint-disable-next-line no-console
  console.log(...args);
};
