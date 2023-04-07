import { Ref } from 'react';
import { ChildComponentsConstraint, ROOT_COMPONENT_LABEL } from '../../types';
import { getChildComponentPropsNameProp } from './getChildComponentPropsNameProp';

export function useOuterPropsForInnerComponentGetter(
  outerProps: any,
  outerRef: Ref<any>,
  childComponentsDeclaration: ChildComponentsConstraint | undefined
): (label: string) => object {
  return (label) => {
    if (label === ROOT_COMPONENT_LABEL) {
      const outerPropsCopy = { ...outerProps };
      delete outerPropsCopy.ref;
      if (outerRef) outerPropsCopy.ref = outerRef;
      if (childComponentsDeclaration) {
        for (const label in childComponentsDeclaration) {
          delete outerPropsCopy[getChildComponentPropsNameProp(label)];
        }
      }
      return Object.freeze(outerPropsCopy);
    } else if (label in (childComponentsDeclaration ?? {})) {
      return Object.freeze(
        outerProps[getChildComponentPropsNameProp(label)] ?? {}
      );
    } else {
      throw new Error(`Cannot get props for component with label "${label}".`);
    }
  };
}
