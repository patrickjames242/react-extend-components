import { Fragment } from 'react';
import { createComponentBuilderGetter } from './createComponentBuilderGetter';
import {
  AdditionalComponentsConstraint,
  ComponentBuilderGroup,
  PropsMergeFn,
} from './types';
import { allHtmlTags } from './utils/allHtmlTags';

export type BaseCreateComponentBuilderGroupProps = {
  propsMergeFn?: PropsMergeFn;
};

export function createComponentBuilderGroup<
  AdditionalComponents extends AdditionalComponentsConstraint
>(
  options: {
    additionalComponents: AdditionalComponents;
  } & BaseCreateComponentBuilderGroupProps
): ComponentBuilderGroup<AdditionalComponents>;

export function createComponentBuilderGroup(
  options?: BaseCreateComponentBuilderGroupProps
): ComponentBuilderGroup<{}>;

export function createComponentBuilderGroup(
  ...args: any[]
): ComponentBuilderGroup<any> {
  const options = args[0] ?? {};
  const additionalComponents = options.additionalComponents ?? {};
  const propsMergeFn = options.propsMergeFn;
  const result: any = (...args: any[]) =>
    (createComponentBuilderGetter as any)(...args);
  result.Fragment = createComponentBuilderGetter(Fragment, propsMergeFn);
  for (const tag of allHtmlTags) {
    (result as any)[tag] = createComponentBuilderGetter(tag, propsMergeFn);
  }
  for (const key in additionalComponents) {
    (result as any)[key] = createComponentBuilderGetter(
      additionalComponents[key],
      propsMergeFn
    );
  }
  return result;
}
