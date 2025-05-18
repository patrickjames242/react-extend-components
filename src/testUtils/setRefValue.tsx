import { Ref, RefObject } from 'react';
import { isObject } from '../utils/isObject';
import { Writable } from '../utils/tsHelpers';

/**
 *
 * @returns the cleanup function returned by the ref callback, if applicable
 */
export function setRefValue<V>(
  ref: Ref<V>,
  value: V | null
): (() => void) | undefined {
  if (typeof ref === 'function') {
    const returnVal = ref(value);
    if (typeof returnVal === 'function') {
      return returnVal;
    } else return undefined;
  } else if (isObject(ref)) {
    const mutableRef: Writable<RefObject<V>> = ref;
    mutableRef.current = value;
  }
  return undefined;
}
