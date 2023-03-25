import { Fragment, JSXElementConstructor } from 'react';
import { extendComponent } from './extendComponent';
import { ComponentExtenderGroup, PropsMergeFn } from './types';
import { allHtmlTags } from './utils/allHtmlTags';

export type BaseCreateComponentExtenderGroupProps = {
  propsMergeFn?: PropsMergeFn;
};

export function createComponentExtenderGroup<
  AdditionalComponents extends ComponentExtenderGroup.AdditionalComponentsConstraint
>(
  options: {
    additionalComponents: AdditionalComponents;
  } & BaseCreateComponentExtenderGroupProps
): ComponentExtenderGroup<AdditionalComponents>;

export function createComponentExtenderGroup(
  options?: BaseCreateComponentExtenderGroupProps
): ComponentExtenderGroup<{}>;

export function createComponentExtenderGroup(
  ...args: any[]
): ComponentExtenderGroup<any> {
  const options = args[0] ?? {};
  const additionalComponents = options.additionalComponents ?? {};
  const propsMergeFn = options.propsMergeFn;
  const result: any = (...args: any[]) => (extendComponent as any)(...args);
  result.Fragment = extendComponent(Fragment, propsMergeFn);
  for (const tag of allHtmlTags) {
    (result as any)[tag] = extendComponent(tag, propsMergeFn);
  }
  for (const key in additionalComponents) {
    const { component, additionalComponentPropsMergeFn } = (() => {
      if ('propsMergeFn' in additionalComponents[key]) {
        return {
          component: additionalComponents[key].component,
          additionalComponentPropsMergeFn:
            additionalComponents[key].propsMergeFn,
        };
      } else
        return {
          component: additionalComponents[key],
          additionalComponentPropsMergeFn: propsMergeFn,
        };
    })();
    (result as any)[key] = extendComponent(
      component,
      additionalComponentPropsMergeFn
    );
  }
  return result;
}

export function additionalComponent<
  Component extends JSXElementConstructor<any>
>(
  component: Component,
  propsMergeFn?: PropsMergeFn<Component, any>
): ComponentExtenderGroup.AdditionalComponent<Component> {
  if (propsMergeFn) {
    return {
      propsMergeFn,
      component,
    };
  } else {
    return component;
  }
}
