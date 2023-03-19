import { MutableRefObject } from 'react';
import { setRefValue } from './setRefValue';

test('sets value for object', () => {
  const ref: MutableRefObject<string | null> = { current: null };
  setRefValue(ref, 'test');
  expect(ref.current).toBe('test');
  setRefValue(ref, 'foo');
  expect(ref.current).toBe('foo');
  setRefValue(ref, null);
  expect(ref.current).toBe(null);
});

test('sets value for function', () => {
  const ref = jest.fn();
  setRefValue(ref, 'test');
  expect(ref).toHaveBeenNthCalledWith(1, 'test');
  setRefValue(ref, 'foo');
  expect(ref).toHaveBeenNthCalledWith(2, 'foo');
  setRefValue(ref, null);
  expect(ref).toHaveBeenNthCalledWith(3, null);
});
