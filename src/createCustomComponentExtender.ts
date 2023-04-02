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
  const customExtenderPropsMergeFn = options.propsMergeFn;

  /**
   * Here we're wrapping the extendComponentFn so that the props merge function provided to the createCustomComponentExtender function is used by default if no props merge function is provided when calling the resulting function.
   */
  const result: any = (
    baseComponent: any,
    childComponentsOrPropsMergeFn?: any,
    propsMergeFn?: any
  ) => {
    if (typeof childComponentsOrPropsMergeFn === 'object') {
      return extendComponentFn(
        baseComponent,
        childComponentsOrPropsMergeFn,
        propsMergeFn ?? customExtenderPropsMergeFn
      );
    } else {
      return extendComponentFn(
        baseComponent,
        childComponentsOrPropsMergeFn ?? customExtenderPropsMergeFn
      );
    }
  };
  result.Fragment = extendComponentFn(Fragment, customExtenderPropsMergeFn);
  for (const tag of allHtmlTags) {
    (result as any)[tag] = extendComponentFn(tag, customExtenderPropsMergeFn);
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
          additionalComponentPropsMergeFn: customExtenderPropsMergeFn,
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
