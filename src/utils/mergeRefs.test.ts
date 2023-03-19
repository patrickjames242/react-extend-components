import { RefCallback, RefObject } from 'react';
import { setRefValue } from '../testUtils/setRefValue';
import { mergeRefs } from './mergeRefs';

test('setting the merged ref sets all the refs', () => {
  const mockRefCallback: RefCallback<string> = jest.fn();
  const refObj1: RefObject<string> = { current: null };
  const refObj2: RefObject<string> = { current: null };

  const mergedRefs = mergeRefs(mockRefCallback, refObj1, refObj2);
  setRefValue(mergedRefs!, 'foo');
  expect(mockRefCallback).toHaveBeenCalledWith('foo');
  expect(refObj1.current).toBe('foo');
  expect(refObj2.current).toBe('foo');

  setRefValue(mergedRefs!, null);
  expect(mockRefCallback).toHaveBeenCalledWith(null);
  expect(refObj1.current).toBe(null);
  expect(refObj2.current).toBe(null);

  setRefValue(mergedRefs!, 'bar');
  expect(mockRefCallback).toHaveBeenCalledWith('bar');
  expect(refObj1.current).toBe('bar');
  expect(refObj2.current).toBe('bar');
});

test('returns undefined when all refs are nullable', () => {
  const mergedRefs = mergeRefs(null, undefined, null, undefined);
  expect(mergedRefs).toBeUndefined();
});
