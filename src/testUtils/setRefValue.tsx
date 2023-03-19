import { Ref, RefObject } from 'react';
import { isObject } from '../utils/isObject';
import { Writable } from '../utils/tsHelpers';

export function setRefValue<V>(ref: Ref<V>, value: V | null): void {
  if (typeof ref === 'function') ref(value);
  else if (isObject(ref)) {
    const mutableRef: Writable<RefObject<V>> = ref;
    mutableRef.current = value;
  }
}
