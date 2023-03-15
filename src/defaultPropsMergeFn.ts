import { DefaultPropsMergeFn } from './types';
import { isObject } from './utils/isObject';
import { mergeRefs } from './utils/mergeRefs';

export const defaultPropsMergeFn: DefaultPropsMergeFn = ({
  innerProps,
  outerProps,
}) => {
  const mergedProps = {
    ...outerProps,
    ...innerProps,
  };

  for (const key in outerProps) {
    if (!(key in innerProps)) continue;
    if (key === 'ref') {
      if (innerProps.ref == null && outerProps.ref != null) {
        mergedProps.ref = outerProps.ref;
      } else if (outerProps.ref == null && innerProps.ref != null) {
        mergedProps.ref = innerProps.ref;
      } else if (outerProps.ref != null && innerProps.ref != null) {
        mergedProps.ref = mergeRefs(innerProps.ref, outerProps.ref);
      }
    } else if (
      key === 'style' &&
      (isObject(innerProps[key]) || innerProps[key] == null) &&
      (isObject(outerProps[key]) || outerProps[key] == null)
    ) {
      mergedProps[key] = {
        ...(innerProps[key] ?? {}),
        ...(outerProps[key] ?? {}),
      };
    } else if (key === 'className') {
      if (typeof innerProps[key] === 'string' && outerProps[key] == null) {
        mergedProps[key] = innerProps[key];
      } else if (
        typeof outerProps[key] === 'string' &&
        innerProps[key] == null
      ) {
        mergedProps[key] = outerProps[key];
      } else if (
        typeof innerProps[key] === 'string' &&
        typeof outerProps[key] === 'string'
      ) {
        mergedProps[key] = innerProps[key] + ' ' + outerProps[key];
      }
    } else if (
      (typeof innerProps[key] === 'function' &&
        typeof outerProps[key] === 'function') ||
      (typeof outerProps[key] === 'function' && innerProps[key] == null)
    ) {
      mergedProps[key] = function (...args: any[]) {
        const innerFnReturnVal = innerProps[key]?.(...args);
        const outerFnReturnVal = outerProps[key]?.(...args);
        if (typeof innerProps[key] === 'function') {
          return innerFnReturnVal;
        } else {
          return outerFnReturnVal;
        }
      };
    }
  }
  return mergedProps;
};
