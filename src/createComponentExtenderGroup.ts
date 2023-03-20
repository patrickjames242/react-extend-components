import { Fragment } from 'react';
import { extendComponent } from './extendComponent';
import {
  AdditionalComponentsConstraint,
  ComponentExtenderGroup,
  PropsMergeFn,
} from './types';
import { allHtmlTags } from './utils/allHtmlTags';

export type BaseCreateComponentExtenderGroupProps = {
  propsMergeFn?: PropsMergeFn;
};

export function createComponentExtenderGroup<
  AdditionalComponents extends AdditionalComponentsConstraint
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
    (result as any)[key] = extendComponent(
      additionalComponents[key],
      propsMergeFn
    );
  }
  return result;
}
