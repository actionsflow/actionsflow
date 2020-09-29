import { getCache, removeCache } from "../cache";

const CACHE_KEY = `__test__`;

afterEach(async () => {
  await removeCache(CACHE_KEY);
});

test(`it returns a new cache instance`, () => {
  const cache = getCache(CACHE_KEY);

  expect(cache.get).toEqual(expect.any(Function));
  expect(cache.set).toEqual(expect.any(Function));
});

test(`it retrieves already created cache instance`, async () => {
  const key = `some-value`;
  const value = [`a`, `b`, `c`];
  const cache = getCache(CACHE_KEY);
  await cache.set(key, value);
  const other = getCache(CACHE_KEY);
  const cachedValue = await other.get(key);
  expect(cachedValue).toEqual(value);
});
