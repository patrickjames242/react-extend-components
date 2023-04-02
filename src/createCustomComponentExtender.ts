import { Fragment, JSXElementConstructor } from 'react';
import { extendComponentFn } from './extendComponentFn/extendComponentFn';
import { ComponentExtender, PropsMergeFn } from './types';
import { allHtmlTags } from './utils/allHtmlTags';

export type BaseCreateCustomComponentExtenderProps = {
  propsMergeFn?: PropsMergeFn;
};

export function createCustomComponentExtender<
  AdditionalComponents extends ComponentExtender.AdditionalComponentsConstraint
>(
  options: {
    additionalComponents: AdditionalComponents;
  } & BaseCreateCustomComponentExtenderProps
): ComponentExtender<AdditionalComponents>;

export function createCustomComponentExtender(
  options?: BaseCreateCustomComponentExtenderProps
): ComponentExtender<{}>;

export function createCustomComponentExtender(
  ...args: any[]
): ComponentExtender<any> {
  const options = args[0] ?? {};
  const additionalComponents = options.additionalComponents ?? {};
  const propsMergeFn = options.propsMergeFn;
  const result: any = (...args: any[]) => (extendComponentFn as any)(...args);
  result.Fragment = extendComponentFn(Fragment, propsMergeFn);
  for (const tag of allHtmlTags) {
    (result as any)[tag] = extendComponentFn(tag, propsMergeFn);
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
    (result as any)[key] = extendComponentFn(
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
): ComponentExtender.AdditionalComponent<Component> {
  if (propsMergeFn) {
    return {
      propsMergeFn,
      component,
    };
  } else {
    return component;
  }
}
