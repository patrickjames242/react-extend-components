import {
  ExtendableComponentInfo,
  ExtendableComponentType,
  EXTENDABLE_COMPONENT_INFO,
} from '../types';
import { isObject } from './isObject';

export function forEachExtendableComponentChild(
  extendableComponent: ExtendableComponentType,
  fn: (child: ExtendableComponentInfo.ChildComponent) => void
): void {
  if (
    (typeof extendableComponent === 'function' ||
      isObject(extendableComponent)) &&
    extendableComponent[EXTENDABLE_COMPONENT_INFO]?.childComponents
  ) {
    for (const child of extendableComponent[EXTENDABLE_COMPONENT_INFO]
      .childComponents) {
      fn(child);
    }
  }
}
