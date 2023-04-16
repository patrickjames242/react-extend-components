import { ForwardRefExoticComponent } from 'react';
import {
  CanHaveExtendableComponentInfo,
  ChildComponentsConstraint,
  ExtendableComponentInfo,
  ExtendableComponentType,
  EXTENDABLE_COMPONENT_INFO,
  PropPath,
} from '../../types';
import { forEachExtendableComponentChild } from '../../utils/forEachExtendableComponentChild';
import { getChildComponentPropsNameProp } from '../../utils/getChildComponentPropsNameProp';
import { normalizePropPath } from '../../utils/normalizePropPath';

export function setExtendableComponentInfoOnResultingComponent(
  baseComponent: ExtendableComponentType,
  resultingComponent: ForwardRefExoticComponent<any>,
  childComponentsDeclaration: ChildComponentsConstraint | undefined
): void {
  const childComponentPropInfoObjs = (() => {
    const result: ExtendableComponentInfo.ChildComponent[] = [];
    function appendChildComponentInfoFromComponent(
      component: ExtendableComponentType,
      currentPath: PropPath
    ): void {
      forEachExtendableComponentChild(component, (child) => {
        result.push({
          ...child,
          propPath: [
            ...normalizePropPath(currentPath),
            ...normalizePropPath(child.propPath),
          ],
        });
      });
    }
    appendChildComponentInfoFromComponent(baseComponent, []);
    for (const child in childComponentsDeclaration) {
      appendChildComponentInfoFromComponent(
        childComponentsDeclaration[child]!,
        getChildComponentPropsNameProp(child)
      );
      result.push({
        propPath: getChildComponentPropsNameProp(child),
        type: childComponentsDeclaration[child]!,
      });
    }
    return result;
  })();

  (resultingComponent as CanHaveExtendableComponentInfo)[
    EXTENDABLE_COMPONENT_INFO
  ] = {
    childComponents: childComponentPropInfoObjs,
  };
}
