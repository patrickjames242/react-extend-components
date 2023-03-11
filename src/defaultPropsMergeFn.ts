import { PropsMergeFn } from './types';
import { mergeRefs } from './utils/mergeRefs';

export const defaultPropsMergeFn: PropsMergeFn = ({
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
    if (key === 'style') {
      (mergedProps as any)[key] = {
        ...innerProps[key],
        ...outerProps[key],
      };
      continue;
    }
    if (key === 'className') {
      mergedProps[key] = (innerProps[key] ?? '') + (outerProps[key] ?? '');
    } else if (
      typeof innerProps[key] === 'function' &&
      typeof outerProps[key] === 'function'
    ) {
      (mergedProps as any)[key] = function (...args: any[]) {
        outerProps[key](...args);
        return innerProps[key](...args);
      };
    }
  }
};
