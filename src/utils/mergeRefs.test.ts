import { RefCallback, RefObject } from 'react';
import { setRefValue } from '../testUtils/setRefValue';
import { __mergeRefs } from './mergeRefs';

test('setting the merged ref sets all the refs', () => {
  const mockRefCallback: RefCallback<string> = jest.fn();
  const refObj1: RefObject<string> = { current: null };
  const refObj2: RefObject<string> = { current: null };

  const mergedRefs = __mergeRefs([mockRefCallback, refObj1, refObj2], false);
  setRefValue(mergedRefs!, 'foo');
  expect(mockRefCallback).toHaveBeenNthCalledWith(1, 'foo');
  expect(refObj1.current).toBe('foo');
  expect(refObj2.current).toBe('foo');

  setRefValue(mergedRefs!, null);
  expect(mockRefCallback).toHaveBeenNthCalledWith(2, null);
  expect(refObj1.current).toBe(null);
  expect(refObj2.current).toBe(null);

  setRefValue(mergedRefs!, 'bar');
  expect(mockRefCallback).toHaveBeenNthCalledWith(3, 'bar');
  expect(refObj1.current).toBe('bar');
  expect(refObj2.current).toBe('bar');
});

test('returns undefined when all refs are nullable', () => {
  const mergedRefs = __mergeRefs([null, undefined, null, undefined], false);
  expect(mergedRefs).toBeUndefined();
});

test('setting the merged ref sets all the refs (with cleanup function)', () => {
  const mockRefCallback: RefCallback<string> = jest.fn();
  const refObj1: RefObject<string> = { current: null };
  const refObj2: RefObject<string> = { current: null };

  const mergedRefs = __mergeRefs([mockRefCallback, refObj1, refObj2], false);
  setRefValue(mergedRefs!, 'foo');
  expect(mockRefCallback).toHaveBeenNthCalledWith(1, 'foo');
  expect(refObj1.current).toBe('foo');
  expect(refObj2.current).toBe('foo');

  setRefValue(mergedRefs!, null);
  expect(mockRefCallback).toHaveBeenNthCalledWith(2, null);
  expect(refObj1.current).toBe(null);
  expect(refObj2.current).toBe(null);

  setRefValue(mergedRefs!, 'bar');
  expect(mockRefCallback).toHaveBeenNthCalledWith(3, 'bar');
  expect(refObj1.current).toBe('bar');
  expect(refObj2.current).toBe('bar');
});

test('merged ref cleanup functions are run', () => {
  const mockRefCallbackCleanupFunction: () => void = jest.fn();
  const mockRefCallbackWithCleanupFunction: RefCallback<string> = jest.fn(
    () => mockRefCallbackCleanupFunction
  );
  const mockRefCallbackWithoutCleanupFunction: RefCallback<string> = jest.fn();
  const refObj1: RefObject<string> = { current: null };
  const refObj2: RefObject<string> = { current: null };

  const mergedRefs = __mergeRefs(
    [
      mockRefCallbackWithCleanupFunction,
      refObj1,
      refObj2,
      mockRefCallbackWithoutCleanupFunction,
    ],
    true
  )!;

  let cleanupFunction = setRefValue(mergedRefs!, 'foo')!;

  expect(mockRefCallbackWithCleanupFunction).toHaveBeenNthCalledWith(1, 'foo');
  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenCalledTimes(1);
  expect(refObj1.current).toBe('foo');
  expect(refObj2.current).toBe('foo');

  cleanupFunction();

  expect(mockRefCallbackWithCleanupFunction).toHaveBeenCalledTimes(1);
  expect(mockRefCallbackCleanupFunction).toHaveBeenCalledTimes(1);

  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenCalledTimes(2);
  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenNthCalledWith(
    2,
    null
  );

  expect(refObj1.current).toBe(null);
  expect(refObj2.current).toBe(null);

  cleanupFunction = setRefValue(mergedRefs!, 'bar')!;

  expect(mockRefCallbackWithCleanupFunction).toHaveBeenCalledTimes(2);
  expect(mockRefCallbackWithCleanupFunction).toHaveBeenNthCalledWith(2, 'bar');
  expect(mockRefCallbackCleanupFunction).toHaveBeenCalledTimes(1);

  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenCalledTimes(3);
  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenNthCalledWith(
    3,
    'bar'
  );

  expect(refObj1.current).toBe('bar');
  expect(refObj2.current).toBe('bar');

  cleanupFunction();

  expect(mockRefCallbackWithCleanupFunction).toHaveBeenCalledTimes(2);
  expect(mockRefCallbackCleanupFunction).toHaveBeenCalledTimes(2);

  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenCalledTimes(4);
  expect(mockRefCallbackWithoutCleanupFunction).toHaveBeenNthCalledWith(
    4,
    null
  );

  expect(refObj1.current).toBe(null);
  expect(refObj2.current).toBe(null);
});
