import { DefaultPropsMergeFn } from './types';
import { isObject } from './utils/isObject';
import { mergeRefs } from './utils/mergeRefs';

export const defaultPropsMergeFn: DefaultPropsMergeFn = ({
  innerProps,
  outerProps,
}) => {
  const mergedProps = naivelyMergeObjectsIgnoringUndefined(
    innerProps,
    outerProps
  );

  //TODO: reverse this so outer props override inner props

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
      mergedProps[key] = naivelyMergeObjectsIgnoringUndefined(
        innerProps[key] ?? {},
        outerProps[key] ?? {}
      );
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
      (typeof outerProps[key] === 'function' && innerProps[key] == null) ||
      (typeof innerProps[key] === 'function' && outerProps[key] == null)
    ) {
      mergedProps[key] = function (...args: any[]) {
        const innerFn = innerProps[key],
          outerFn = outerProps[key];
        const innerFnReturnVal = innerFn?.(...args);
        const outerFnReturnVal = outerFn?.(...args);
        if (typeof outerFn === 'function') {
          return outerFnReturnVal;
        } else {
          return innerFnReturnVal;
        }
      };
    }
  }
  return mergedProps;
};

/// naively merges props together (overriding props in o1 with props in o2), but does not allow values explicitly set to undefined in o2 to override those values in o1
function naivelyMergeObjectsIgnoringUndefined<
  O1 extends object,
  O2 extends object
>(o1: O1, o2: O2): O1 & O2 {
  const x = {
    ...o1,
    ...o2,
  };

  for (const key in o1) {
    if ((o2 as any)[key] === undefined) {
      (x as any)[key] = o1[key];
    }
  }

  return x;
}
