import { useEffect, useMemo, useRef, useState } from 'react';
import type { TinyEmitter as TinyEmitterT } from 'tiny-emitter';
import { useIsomorphicLayoutEffect } from '../../utils/useIsomorphicLayoutEffect';

const TinyEmitter = require('tiny-emitter');

export interface ValueObservable<V> {
  latestValue: () => V;
  subscribe: (handler: (value: V) => void) => { unsubscribe: () => void };
}

const EMITTER_VALUE_EVENT = 'value';

export function useCreateValueObservable<V>(value: V): ValueObservable<V> {
  const latestValueRef = useRef<V>(value);
  latestValueRef.current = value;

  const emitter = useMemo<TinyEmitterT>(() => new TinyEmitter(), []);

  useIsomorphicLayoutEffect(() => {
    emitter.emit(EMITTER_VALUE_EVENT, value);
  }, [emitter, value]);

  useEffect(() => {
    return () => {
      emitter.off(EMITTER_VALUE_EVENT);
    };
  }, [emitter]);

  return useMemo<ValueObservable<V>>(() => {
    return {
      latestValue: () => latestValueRef.current,
      subscribe: (handler) => {
        handler(latestValueRef.current);
        emitter.on(EMITTER_VALUE_EVENT, handler);
        return {
          unsubscribe: (): void => {
            emitter.off(EMITTER_VALUE_EVENT, handler);
          },
        };
      },
    };
  }, [emitter]);
}

export function useConsumeObservableValue<V>(
  observable: ValueObservable<V>
): V {
  const [value, setValue] = useState(observable.latestValue());

  useIsomorphicLayoutEffect(() => {
    const { unsubscribe } = observable.subscribe(setValue);
    return () => unsubscribe();
  }, [observable]);

  return value;
}
