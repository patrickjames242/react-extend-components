import { renderHook } from '@testing-library/react';
import {
  useConsumeObservableValue,
  useCreateValueObservable,
} from './ValueObservable';

describe('useCreateValueObservable hook', () => {
  test('latest value returns correct value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useCreateValueObservable(value),
      { initialProps: { value: 3 } }
    );
    expect(result.current.latestValue()).toBe(3);
    rerender({ value: 4 });
    expect(result.current.latestValue()).toBe(4);
    rerender({ value: 500 });
    expect(result.current.latestValue()).toBe(500);
  });

  test('subscriptions receive correct values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useCreateValueObservable(value),
      { initialProps: { value: 'blah' } }
    );
    const subscriptionFn = jest.fn();
    result.current.subscribe(subscriptionFn);
    expect(subscriptionFn).toHaveBeenNthCalledWith(1, 'blah');
    rerender({ value: 'foo' });
    expect(subscriptionFn).toHaveBeenNthCalledWith(2, 'foo');
    rerender({ value: 'bar' });
    expect(subscriptionFn).toHaveBeenNthCalledWith(3, 'bar');
  });

  test('unsubscribing prevents listener from being called', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useCreateValueObservable(value),
      { initialProps: { value: 'blah' } }
    );
    const subscriptionFn = jest.fn();
    const { unsubscribe } = result.current.subscribe(subscriptionFn);
    unsubscribe();
    rerender({ value: 'foo' });
    rerender({ value: 'bar' });
    rerender({ value: 'baz' });
    expect(subscriptionFn).toHaveBeenCalledTimes(1); // called once because listeners are called immediately when you subscribe.
    expect(subscriptionFn).toHaveBeenNthCalledWith(1, 'blah');
  });

  test("return value doesn't change between renders", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useCreateValueObservable(value),
      { initialProps: { value: 'blah' } }
    );
    const firstValue = result.current;

    const expectReturnValHasNotChanged = (): void => {
      expect(result.current).toEqual(firstValue);
      expect(result.current).toBe(firstValue);
      expect(result.current.latestValue).toBe(firstValue.latestValue);
      expect(result.current.subscribe).toBe(firstValue.subscribe);
    };

    rerender({ value: 'foo' });
    expectReturnValHasNotChanged();
    rerender({ value: 'bar' });
    expectReturnValHasNotChanged();
    rerender({ value: 'baz' });
    expectReturnValHasNotChanged();
  });
});

describe('useConsumeObservableValue hook', () => {
  test('returns latest value', () => {
    const { result, rerender } = renderHook(
      ({ value }) => {
        const observable = useCreateValueObservable(value);
        return useConsumeObservableValue(observable);
      },
      { initialProps: { value: 3 } }
    );
    expect(result.current).toBe(3);
    rerender({ value: 4 });
    expect(result.current).toBe(4);
    rerender({ value: 500 });
    expect(result.current).toBe(500);
  });

  test('value change only triggers a single rerender', () => {
    const observableHook = renderHook(
      ({ value }) => useCreateValueObservable(value),
      { initialProps: { value: 'foo' } }
    );

    const renderFn = jest.fn();
    renderHook(() => {
      renderFn();
      return useConsumeObservableValue(observableHook.result.current);
    });

    expect(renderFn).toHaveBeenCalledTimes(1);
    observableHook.rerender({ value: 'bar' });
    expect(renderFn).toHaveBeenCalledTimes(2);
    observableHook.rerender({ value: 'baz' });
    expect(renderFn).toHaveBeenCalledTimes(3);
  });
});
