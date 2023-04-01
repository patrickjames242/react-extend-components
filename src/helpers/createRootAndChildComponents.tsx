import {
  ChildComponentsConstraint,
  ExtendableComponentType,
  FilterChildComponents,
  ROOT_COMPONENT_LABEL,
} from '../types';
import { capitalizeFirstLetter } from '../utils/capitalizeFirstLetter';
import { getInnerComponent } from './getInnerComponent';

export function createRootAndChildComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint
>(
  baseComponent: BaseComponent,
  childComponents?: ChildComponents
): { [ROOT_COMPONENT_LABEL]: BaseComponent } & {
  [K in keyof FilterChildComponents<ChildComponents> as Capitalize<
    K & string
  >]: FilterChildComponents<ChildComponents>[K];
} {
  const resultObj: any = {};
  resultObj[ROOT_COMPONENT_LABEL] = getInnerComponent(
    baseComponent,
    ROOT_COMPONENT_LABEL
  );
  if (childComponents) {
    for (const key in childComponents) {
      resultObj[capitalizeFirstLetter(key)] = getInnerComponent(
        childComponents[key]!,
        key
      );
    }
  }
  return resultObj;
}
