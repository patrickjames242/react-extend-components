import { Ref, RefObject } from 'react';
import { isObject } from './isObject';
import { Writable } from './tsHelpers';

export function setRefValue<V>(ref: Ref<V>, value: V | null): void {
  if (typeof ref === 'function') ref(value);
  else if (isObject(ref)) {
    const mutableRef: Writable<RefObject<V>> = ref;
    mutableRef.current = value;
  }
}
