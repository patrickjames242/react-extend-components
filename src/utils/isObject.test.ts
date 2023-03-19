import { isObject } from './isObject';

test('returns true for object', () => {
  expect(isObject({})).toBe(true);
  expect(isObject([])).toBe(true);
});

test('returns false for anything other than an object', () => {
  expect(isObject(null)).toBe(false);
  expect(isObject(undefined)).toBe(false);
  expect(isObject(1)).toBe(false);
  expect(isObject('')).toBe(false);
  expect(isObject(true)).toBe(false);
  expect(isObject(Symbol(''))).toBe(false);
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  expect(isObject(() => {})).toBe(false);
});
