import { DefaultPropsMergeFn } from './types';
import { isObject } from './utils/isObject';
import { mergeRefs } from './utils/mergeRefs';

export const defaultPropsMergeFn: DefaultPropsMergeFn = ({
  innerProps: { ref: innerRef, ...innerProps },
  outerProps: { ref: outerRef, ...outerProps },
}) => {
  const mergedProps = {
    ...outerProps,
    ...innerProps,
    ref: mergeRefs(innerRef, outerRef),
  };

  for (const key in outerProps) {
    if (!(key in innerProps)) continue;
    if (
      key === 'style' &&
      isObject(innerProps[key]) &&
      isObject(outerProps[key])
    ) {
      mergedProps[key] = {
        ...innerProps[key],
        ...outerProps[key],
      };
    } else if (
      key === 'className' &&
      typeof innerProps[key] === 'string' &&
      typeof outerProps[key] === 'string'
    ) {
      mergedProps[key] =
        (innerProps[key] ?? '') + ' ' + (outerProps[key] ?? '');
    } else if (
      typeof innerProps[key] === 'function' &&
      typeof outerProps[key] === 'function'
    ) {
      mergedProps[key] = function (...args: any[]) {
        const innerFnReturnVal = innerProps[key](...args);
        outerProps[key](...args);
        return innerFnReturnVal;
      };
    }
  }
  return mergedProps;
};
