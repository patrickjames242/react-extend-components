import { Ref } from 'react';
import { ChildComponentsConstraint, ROOT_COMPONENT_LABEL } from '../../types';
import { getChildComponentPropsNameProp } from '../../utils/getChildComponentPropsNameProp';

export function useOuterPropsForInnerComponentGetter(
  outerProps: any,
  outerRef: Ref<any>,
  childComponentsDeclaration: ChildComponentsConstraint | undefined
): (label: string) => object {
  // not using useRef/useMemo/useCallback because we want to recalculate on every render since props can change on every render

  const propCache = new Map<string, object>();

  return (label) => {
    if (propCache.has(label)) return propCache.get(label);

    const props = (() => {
      if (label === ROOT_COMPONENT_LABEL) {
        const outerPropsCopy = { ...outerProps };
        delete outerPropsCopy.ref;
        if (outerRef) outerPropsCopy.ref = outerRef;
        if (childComponentsDeclaration) {
          for (const label in childComponentsDeclaration) {
            delete outerPropsCopy[getChildComponentPropsNameProp(label)];
          }
        }
        return outerPropsCopy;
      } else if (label in (childComponentsDeclaration ?? {})) {
        return outerProps[getChildComponentPropsNameProp(label)] ?? {};
      } else {
        throw new Error(
          `Cannot get props for component with label "${label}".`
        );
      }
    })();

    Object.freeze(props);
    propCache.set(label, props);
    return props;
  };
}
