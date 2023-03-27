/* eslint-disable max-lines */
import {
  ElementType,
  FC,
  Fragment,
  JSXElementConstructor,
  ReactNode,
  Ref,
} from 'react';
import type { allHtmlTags } from './utils/allHtmlTags';

export type ExtendableComponentType =
  | keyof JSX.IntrinsicElements
  | JSXElementConstructor<any>;
export type ExtendableComponentProps<
  ComponentType extends ExtendableComponentType
> = ComponentType extends ElementType
  ? React.ComponentPropsWithRef<ComponentType>
  : never;

export type FCReturnType = JSX.Element | null;
export type RefTypeConstraint = any | 'default';

export type BaseComponentPropsToIncludeConstraint<
  BaseComponent extends ExtendableComponentType
> =
  | keyof Partial<ExtendableComponentProps<BaseComponent>>
  | string
  | number
  | symbol;

export type DefaultPropsMergeFn = (info: {
  outerProps: ResultComponentProps<any, any, any, any>;
  innerProps: ExtendableComponentProps<any>;
}) => ExtendableComponentProps<any>;

export type PropsMergeFn<
  BaseComponent extends ExtendableComponentType = any,
  AdditionalProps extends object = any,
  RefType extends RefTypeConstraint = any,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent> = any
> = (info: {
  outerProps: ResultComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >;
  innerProps: ExtendableComponentProps<BaseComponent>;
  defaultMergeFn: DefaultPropsMergeFn;
}) => ExtendableComponentProps<BaseComponent>;

export interface PropHelpers<
  BaseComponent extends ExtendableComponentType,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> {
  detectPlucked: () => ResultComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >;

  pluck: <
    Attributes extends keyof ResultComponentProps<
      BaseComponent,
      AdditionalProps,
      RefType,
      BaseComponentPropsToInclude
    > = never
  >(
    ...attributes: Attributes[]
  ) => {
    [Key in Attributes]: ResultComponentProps<
      BaseComponent,
      AdditionalProps,
      RefType,
      BaseComponentPropsToInclude
    >[Key];
  };

  pluckAll: () => ResultComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >;

  peek: () => ResultComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >;
}

export type RenderFn<
  BaseComponent extends ExtendableComponentType,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> = (
  RootComponent: RootComponent<BaseComponent>,
  props: ResultComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  helpers: PropHelpers<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => ReactNode;

export type RootComponent<BaseComponent extends ExtendableComponentType> = (
  props: ExtendableComponentProps<BaseComponent>
) => FCReturnType;

export type ResultComponentProps<
  BaseComponent extends ExtendableComponentType,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<ExtendableComponentType>
> = Omit<
  Omit<
    Partial<
      Pick<ExtendableComponentProps<BaseComponent>, BaseComponentPropsToInclude>
    >,
    'children' | keyof AdditionalProps
  > &
    AdditionalProps,
  RefType extends 'default' ? never : 'ref'
> &
  (RefType extends 'default' ? {} : { ref?: Ref<RefType> });

export type ComponentExtenderGetter = <
  BaseComponent extends ExtendableComponentType
>(
  baseComponent: BaseComponent,
  propsMergeFn?: PropsMergeFn<BaseComponent>
) => ComponentExtender<BaseComponent>;

export type ComponentExtender<BaseComponent extends ExtendableComponentType> = <
  AdditionalProps extends object,
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent> = keyof ExtendableComponentProps<BaseComponent>
>(
  renderFn: RenderFn<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  propsMergeFn?: PropsMergeFn<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => FC<
  ResultComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
>;

export type ComponentExtenderGroup<
  AdditionalComponents extends ComponentExtenderGroup.AdditionalComponentsConstraint
> = ComponentExtenderGetter & {
  Fragment: ComponentExtender<typeof Fragment>;
} & {
  [Tag in (typeof allHtmlTags)[number]]: ComponentExtender<Tag>;
} & {
  [ComponentKey in keyof AdditionalComponents]: ComponentExtender<
    AdditionalComponents[ComponentKey] extends ComponentExtenderGroup.AdditionalComponent<
      infer T
    >
      ? T
      : never
  >;
};

export namespace ComponentExtenderGroup {
  export type AdditionalComponent<
    Component extends JSXElementConstructor<any>
  > =
    | Component
    | {
        propsMergeFn: PropsMergeFn<Component, any>;
        component: Component;
      };
  export type AdditionalComponentsConstraint = Record<
    string,
    AdditionalComponent<JSXElementConstructor<any>>
  >;
}
