import {
  ElementType,
  FC,
  Fragment,
  JSXElementConstructor,
  ReactNode,
  Ref,
} from 'react';
import type { createComponentBuilderGetter } from './createComponentBuilderGetter';
import { allHtmlTags } from './utils/allHtmlTags';

export type ReactTag = keyof JSX.IntrinsicElements | JSXElementConstructor<any>;
export type ReactTagProps<Tag extends ReactTag> = Tag extends ElementType
  ? React.ComponentPropsWithRef<Tag>
  : never;

export type FCReturnType = JSX.Element | null;
export type RefTypeConstraint = any | 'default';

export type RootPropsToIncludeConstraint<RootTag extends ReactTag> =
  | keyof Partial<ReactTagProps<RootTag>>
  | string
  | number
  | symbol;

export type DefaultPropsMergeFn = (info: {
  outerProps: ResultComponentProps<any, any, any, any>;
  innerProps: ReactTagProps<any>;
}) => ReactTagProps<any>;

export type PropsMergeFn<
  RootTag extends ReactTag = any,
  AdditionalProps extends object = any,
  RefType extends RefTypeConstraint = any,
  RootPropsToInclude extends RootPropsToIncludeConstraint<RootTag> = any
> = (info: {
  outerProps: ResultComponentProps<
    RootTag,
    AdditionalProps,
    RefType,
    RootPropsToInclude
  >;
  innerProps: ReactTagProps<RootTag>;
  defaultMergeFn: DefaultPropsMergeFn;
}) => ReactTagProps<RootTag>;

export interface Props<
  RootTag extends ReactTag,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  RootPropsToInclude extends RootPropsToIncludeConstraint<RootTag>
> {
  pluck: <
    Attributes extends keyof ResultComponentProps<
      RootTag,
      AdditionalProps,
      RefType,
      RootPropsToInclude
    > = never
  >(
    ...attributes: Attributes[]
  ) => {
    [Key in Attributes]: ResultComponentProps<
      RootTag,
      AdditionalProps,
      RefType,
      RootPropsToInclude
    >[Key];
  };

  pluckAll: () => ResultComponentProps<
    RootTag,
    AdditionalProps,
    RefType,
    RootPropsToInclude
  >;

  peek: () => ResultComponentProps<
    RootTag,
    AdditionalProps,
    RefType,
    RootPropsToInclude
  >;
}

export type RenderFn<
  RootTag extends ReactTag,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  RootPropsToInclude extends RootPropsToIncludeConstraint<RootTag>
> = (
  RootComponent: RootComponent<RootTag>,
  props: Props<RootTag, AdditionalProps, RefType, RootPropsToInclude>
) => ReactNode;

export type RootComponent<RootTag extends ReactTag> = (
  props: ReactTagProps<RootTag>
) => FCReturnType;

export type ResultComponentProps<
  RootTag extends ReactTag,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  RootPropsToInclude extends RootPropsToIncludeConstraint<ReactTag>
> = Omit<
  Omit<
    Partial<Pick<ReactTagProps<RootTag>, RootPropsToInclude>>,
    'children' | keyof AdditionalProps
  > &
    AdditionalProps,
  RefType extends 'default' ? never : 'ref'
> &
  (RefType extends 'default' ? {} : { ref?: Ref<RefType> });

export type ComponentBuilderGetter = <RootTag extends ReactTag>(
  rootTag: RootTag,
  propsMergeFn?: PropsMergeFn<RootTag>
) => ComponentBuilder<RootTag>;

export type ComponentBuilder<RootTag extends ReactTag> = <
  AdditionalProps extends object,
  RefType extends RefTypeConstraint = 'default',
  RootPropsToInclude extends RootPropsToIncludeConstraint<RootTag> = keyof ReactTagProps<RootTag>
>(
  renderFn: RenderFn<RootTag, AdditionalProps, RefType, RootPropsToInclude>,
  propsMergeFn?: PropsMergeFn<
    RootTag,
    AdditionalProps,
    RefType,
    RootPropsToInclude
  >
) => FC<
  ResultComponentProps<RootTag, AdditionalProps, RefType, RootPropsToInclude>
>;

export type AdditionalComponentsConstraint = Record<
  string,
  JSXElementConstructor<any>
>;

export type ComponentBuilderGroup<
  AdditionalComponents extends AdditionalComponentsConstraint
> = typeof createComponentBuilderGetter & {
  Fragment: ComponentBuilder<typeof Fragment>;
} & {
  [Tag in (typeof allHtmlTags)[number]]: ComponentBuilder<Tag>;
} & {
  [ComponentKey in keyof AdditionalComponents]: ComponentBuilder<
    AdditionalComponents[ComponentKey]
  >;
};
