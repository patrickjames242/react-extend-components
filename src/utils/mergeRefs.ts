import * as React from 'react';
import { isObject } from './isObject';

export function mergeRefs<T = any>(
  ...refs: Array<React.Ref<T> | undefined | null>
): React.RefCallback<T> | undefined {
  return __mergeRefs(refs, doesReactSupportRefCleanupFunctions());
}

export function __mergeRefs<T = any>(
  refs: Array<React.Ref<T> | undefined | null>,
  __allowCleanupFunctions: boolean
): React.RefCallback<T> | undefined {
  refs = refs.filter((x) => x != null);
  if (!refs.some((x) => x != null)) return undefined; // if there are only null or undefined elements in the array we return undefined

  if (__allowCleanupFunctions) {
    return (value) => {
      const cleanupFunctions: Map<React.Ref<T>, () => void> = new Map();

      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          try {
            const returnValue = ref(value);
            if (typeof returnValue === 'function') {
              cleanupFunctions.set(ref, returnValue);
            }
          } catch (e) {
            // ignore error
          }
        } else if (isObject(ref)) {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });

      return () => {
        refs.forEach((ref) => {
          if (ref == null) return;
          if (cleanupFunctions.has(ref)) {
            cleanupFunctions.get(ref)?.();
          } else if (typeof ref === 'function') {
            try {
              ref(null);
            } catch (e) {
              // ignore error
            }
          } else if (isObject(ref)) {
            (ref as React.MutableRefObject<T | null>).current = null;
          }
        });
      };
    };
  } else {
    return (value) => {
      refs.forEach((ref) => {
        if (typeof ref === 'function') {
          try {
            ref(value);
          } catch (e) {
            // ignore error
          }
        } else if (isObject(ref)) {
          (ref as React.MutableRefObject<T | null>).current = value;
        }
      });
    };
  }
}

function doesReactSupportRefCleanupFunctions(): boolean {
  if (!React.version) {
    return false;
  }
  return parseInt(React.version.split('.')?.[0] as string) >= 19;
}
