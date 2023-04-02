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

export type ChildComponentsConstraint = Record<string, ExtendableComponentType>;

export type ROOT_COMPONENT_LABEL = 'root';
export const ROOT_COMPONENT_LABEL: ROOT_COMPONENT_LABEL = 'root';

export type FilterChildComponents<
  ChildComponents extends ChildComponentsConstraint
> = Omit<ChildComponents, ROOT_COMPONENT_LABEL>;

export type DefaultPropsMergeFn = (info: {
  outerProps: ResultComponentProps<any, any, any, any, any>;
  innerProps: ExtendableComponentProps<any>;
}) => ExtendableComponentProps<any>;

export type PropsMergeFnInfo<
  BaseComponent extends ExtendableComponentType = any,
  ChildComponents extends ChildComponentsConstraint = any,
  AdditionalProps extends object = any,
  RefType extends RefTypeConstraint = any,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent> = any
> = {
  type:
    | BaseComponent
    | FilterChildComponents<ChildComponents>[keyof FilterChildComponents<ChildComponents>];
  label: ROOT_COMPONENT_LABEL | keyof FilterChildComponents<ChildComponents>;
  outerProps: ResultComponentProps<
    BaseComponent,
    {},
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >;
  innerProps: ExtendableComponentProps<BaseComponent>;
  defaultMergeFn: DefaultPropsMergeFn;
};

export type PropsMergeFn<
  BaseComponent extends ExtendableComponentType = any,
  ChildComponents extends ChildComponentsConstraint = any,
  AdditionalProps extends object = any,
  RefType extends RefTypeConstraint = any,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent> = any
> = (
  info: PropsMergeFnInfo<
    BaseComponent,
    ChildComponents,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => ExtendableComponentProps<BaseComponent>;

export interface PropHelpers<Props extends Record<string, any> = any> {
  detectPlucked: () => Props;
  pluck: <Attributes extends keyof Props = never>(
    ...attributes: Attributes[]
  ) => {
    [Key in Attributes]: Props[Key];
  };
  pluckAll: () => Props;
  peek: () => Props;
}

export interface RootPropHelpers<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> extends PropHelpers<
    ResultComponentProps<
      BaseComponent,
      {},
      AdditionalProps,
      RefType,
      BaseComponentPropsToInclude
    >
  > {
  forChild: <ChildName extends keyof FilterChildComponents<ChildComponents>>(
    childName: ChildName
  ) => PropHelpers<
    ExtendableComponentProps<FilterChildComponents<ChildComponents>[ChildName]>
  >;
}

export type RenderFn<
  BaseComponent extends ExtendableComponentType,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> = (
  RootComponent: RootOrChildComponent<BaseComponent>,
  props: ResultComponentProps<
    BaseComponent,
    {},
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  helpers: RootPropHelpers<
    BaseComponent,
    {},
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => ReactNode;

export type RenderFnWithChildComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> = (
  RootComponent: RootOrChildComponent<BaseComponent>,
  childComponents: {
    [Key in keyof FilterChildComponents<ChildComponents> as `${Capitalize<
      Key & string
    >}`]: RootOrChildComponent<ChildComponents[Key]>;
  },
  props: ResultComponentProps<
    BaseComponent,
    {},
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  helpers: RootPropHelpers<
    BaseComponent,
    FilterChildComponents<ChildComponents>,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => ReactNode;

export type RootOrChildComponent<
  BaseComponent extends ExtendableComponentType
> = (props: ExtendableComponentProps<BaseComponent>) => FCReturnType;

type ChildComponentsAdditionalProps<
  ChildComponents extends ChildComponentsConstraint
> = {
  [Key in keyof FilterChildComponents<ChildComponents> as `${Uncapitalize<
    Key & string
  >}Props`]?: Partial<
    ExtendableComponentProps<FilterChildComponents<ChildComponents>[Key]>
  >;
};

export type ResultComponentProps<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint,
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
  | (RefType extends 'default' ? never : 'ref')
  | keyof ChildComponentsAdditionalProps<ChildComponents>
> &
  (RefType extends 'default' ? {} : { ref?: Ref<RefType> }) &
  ChildComponentsAdditionalProps<ChildComponents>;

export type ComponentExtenderFnGetter = {
  <BaseComponent extends ExtendableComponentType>(
    baseComponent: BaseComponent,
    propsMergeFn?: PropsMergeFn<BaseComponent>
  ): ComponentExtenderFn<BaseComponent>;
  <
    BaseComponent extends ExtendableComponentType,
    ChildComponents extends ChildComponentsConstraint
  >(
    baseComponent: BaseComponent,
    childComponents: ChildComponents,
    propsMergeFn?: PropsMergeFn<BaseComponent, ChildComponents>
  ): ComponentExtenderFnWithChildComponents<
    BaseComponent,
    FilterChildComponents<ChildComponents>
  >;
};

export type ComponentExtenderFn<BaseComponent extends ExtendableComponentType> =
  <
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
      {},
      AdditionalProps,
      RefType,
      BaseComponentPropsToInclude
    >
  ) => FC<
    ResultComponentProps<
      BaseComponent,
      {},
      AdditionalProps,
      RefType,
      BaseComponentPropsToInclude
    >
  >;

export type ComponentExtenderFnWithChildComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint
> = <
  AdditionalProps extends object,
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent> = keyof ExtendableComponentProps<BaseComponent>
>(
  renderFn: RenderFnWithChildComponents<
    BaseComponent,
    ChildComponents,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  propsMergeFn?: PropsMergeFn<
    BaseComponent,
    ChildComponents,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => FC<
  ResultComponentProps<
    BaseComponent,
    ChildComponents,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
>;

export type ComponentExtender<
  AdditionalComponents extends ComponentExtender.AdditionalComponentsConstraint
> = ComponentExtenderFnGetter & {
  Fragment: ComponentExtenderFn<typeof Fragment>;
} & {
  [Tag in (typeof allHtmlTags)[number]]: ComponentExtenderFn<Tag>;
} & {
  [ComponentKey in keyof AdditionalComponents]: ComponentExtenderFn<
    AdditionalComponents[ComponentKey] extends ComponentExtender.AdditionalComponent<
      infer T
    >
      ? T
      : never
  >;
};

export namespace ComponentExtender {
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
