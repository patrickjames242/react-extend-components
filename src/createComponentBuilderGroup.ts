import { Fragment } from 'react';
import { createComponentBuilderGetter } from './createComponentBuilderGetter';
import { AdditionalComponentsConstraint, ComponentBuilderGroup } from './types';
import { allHtmlTags } from './utils/allHtmlTags';

export function createComponentBuilderGroup<
  AdditionalComponents extends AdditionalComponentsConstraint
>(options: {
  additionalComponents: AdditionalComponents;
}): ComponentBuilderGroup<AdditionalComponents>;
export function createComponentBuilderGroup(): ComponentBuilderGroup<{}>;
export function createComponentBuilderGroup(
  ...args: any[]
): ComponentBuilderGroup<any> {
  const options = args[0] ?? {};
  const additionalComponents = options.additionalComponents ?? {};
  const result: any = (...args: any[]) =>
    (createComponentBuilderGetter as any)(...args);
  result.Fragment = createComponentBuilderGetter(Fragment);
  for (const tag of allHtmlTags) {
    (result as any)[tag] = createComponentBuilderGetter(tag);
  }
  for (const key in additionalComponents) {
    (result as any)[key] = createComponentBuilderGetter(
      additionalComponents[key]
    );
  }
  return result;
}
