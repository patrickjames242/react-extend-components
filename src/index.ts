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
  ComponentExtenderFnGetter,
  ComponentExtenderFnWithChildComponents,
  DefaultPropsMergeFn,
  ExtendableComponentProps,
  ExtendableComponentType,
  PropHelpers,
  PropsMergeFn,
  PropsMergeFnInfo,
  RenderFn,
  RenderFnWithChildComponents,
  ResultComponentProps,
  RootOrChildComponent,
  RootPropHelpers,
} from './types';
export { mergeRefs } from './utils/mergeRefs';
export const extendComponent = createCustomComponentExtender();
