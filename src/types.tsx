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
  /**
   * The type of the component being merged
   */
  type:
    | BaseComponent
    | FilterChildComponents<ChildComponents>[keyof FilterChildComponents<ChildComponents>];
  /**
   * The label of the component being merged.
   * This refers either to the label you provided for a child
   * component in the childComponents object, or "root" for the root component
   */
  label: ROOT_COMPONENT_LABEL | keyof FilterChildComponents<ChildComponents>;
  /**
   * The props that were passed to the outermost component
   * by the users of your component
   */
  outerProps: ResultComponentProps<
    BaseComponent,
    {},
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >;
  /**
   * The props that you pass to the inner underlying component
   * within the component declaration
   */
  innerProps: ExtendableComponentProps<BaseComponent>;

  /**
   * The default merge function that react-extend-components uses to merge
   * your props
   */
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
  /**
   * This function is essentially the same magic behind the `props`
   * argument. It wraps all the props provided to the component in a
   * getter which can detect which one you're accessing within the
   * component and hide it from the underlying element by default.
   */
  detectPlucked: () => Props;
  /**
   * Allows you to explicitly specify the props you want to be hidden
   * from the underlying element and returns only those props in the
   * returned object.
   */
  pluck: <Attributes extends keyof Props = never>(
    ...attributes: Attributes[]
  ) => {
    [Key in Attributes]: Props[Key];
  };

  /**
   * Allows you to explicitly specify a single prop you want to be hidden
   * from the underlying element and returns that prop directly.
   */
  pluckOne: <Prop extends keyof Props>(prop: Prop) => Props[Prop];

  /**
   * Hides all props passed to your component from the underlying
   * component by default, and returns all those props in its
   * object return value. In this case you would have to handle the
   * passing of those props to the component yourself.
   */
  pluckAll: () => Props;
  peek: {
    /**
     * Returns all the props that were passed to the component without
     * preventing those props from being passed to the underlying
     * element.
     */
    (): Props;

    /**
     * Returns a single prop that you specify without
     * preventing that prop from being passed to the underlying
     * element.
     */
    <Prop extends keyof Props>(prop: Prop): Props[Prop];
  };
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
  >
) => ReactNode;

export type RootOrChildComponent<Component extends ExtendableComponentType> = ((
  props: ExtendableComponentProps<Component>
) => FCReturnType) & {
  props: PropHelpers<ExtendableComponentProps<Component>>;
};

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
  ChildComponents extends ChildComponentsConstraint = {},
  AdditionalProps extends object = {},
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<ExtendableComponentType> = keyof ExtendableComponentProps<BaseComponent>
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
    AdditionalProps extends object = {},
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
