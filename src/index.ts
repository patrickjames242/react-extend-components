import { createCustomComponentExtender } from './createCustomComponentExtender';
export {
  additionalComponent,
  createCustomComponentExtender,
} from './createCustomComponentExtender';
export type { BaseCreateCustomComponentExtenderProps } from './createCustomComponentExtender';
export { defaultPropsMergeFn } from './defaultPropsMergeFn';
export { MergeFunctionProvider } from './MergeFunctionProvider';
export { ROOT_COMPONENT_LABEL } from './types';
export type {
  ComponentExtender,
  ComponentExtenderFn,
  ComponentExtenderRenderFnProvider,
  ComponentExtenderWithChildComponentsRenderFnProvider,
  DefaultPropsMergeFn,
  ExtendableComponentProps,
  ExtendableComponentType,
  ExtendedComponent,
  ExtendedComponentProps,
  ExtendedComponentWithChildComponents,
  ExtendedComponentWithChildComponentsProps,
  InnerChildComponent,
  InnerRootComponent,
  PropHelpers,
  PropsMergeFn,
  PropsMergeFnInfo,
  RenderFn,
  RenderFnWithChildComponents,
} from './types';
export { mergeRefs } from './utils/mergeRefs';
export const extend = createCustomComponentExtender();
