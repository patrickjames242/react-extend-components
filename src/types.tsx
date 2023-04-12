import {
  ElementType,
  FC,
  Fragment,
  JSXElementConstructor,
  ReactNode,
  Ref,
} from 'react';
import type { allHtmlTags } from './utils/allHtmlTags';

/**
 * The type constraint of components / elements that can be specified
 * as base components or child components.
 */
export type ExtendableComponentType =
  | keyof JSX.IntrinsicElements
  | JSXElementConstructor<any>;

/**
 * A helper type that returns the props of an {@link ExtendableComponentType}
 */
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

type ArrayWithAtLeastOneElement<E> = [E, ...E[]];

export type FilterChildComponents<
  ChildComponents extends ChildComponentsConstraint
> = Omit<ChildComponents, ROOT_COMPONENT_LABEL>;

/**
 * The type of the merge function that is used to merge props
 * if you don't specify a merge function yourself.
 */
export type DefaultPropsMergeFn = (info: {
  outerProps: ExtendedComponentProps<any, any, any, any>;
  innerProps: ExtendableComponentProps<any>;
}) => ExtendableComponentProps<any>;

/**
 * The type of the object passed to merge functions that provides
 * info on the props being merged and the component they are
 * being merged for.
 */
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
  outerProps: ExtendedComponentProps<
    BaseComponent,
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

/**
 * The type of the props merge function that you can provide to the library in
 * various places.
 */
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

/**
 * The type of the props helpers object that you can access on an inner component
 * within the render function.
 *
 * @example
 *
 * const MyComponent = extend('div')(Div => {
 *  Div.props // <-- this is the props helpers object
 *  return <Div />
 * });
 */
export interface PropHelpers<Props extends Record<string, any> = any> {
  /**
   * This function is essentially the same magic behind the `props`
   * argument. It wraps the props object in a
   * [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
   * which can detect which props you're accessing within the component and hide it
   * from the underlying element by default.
   */
  detectPlucked: () => Props;
  /**
   * Allows you to explicitly specify the props you want to be hidden
   * from the underlying element and returns only those props in the
   * returned object.
   */
  pluck: {
    <Attributes extends keyof Props = never>(
      ...attributes: ArrayWithAtLeastOneElement<Attributes>
    ): {
      [Key in Attributes]: Props[Key];
    };
    <Attributes extends keyof Props = never>(): <
      AttributeList extends Attributes[]
    >(
      ...attributes: AttributeList &
        ArrayWithAtLeastOneElement<AttributeList[number]> &
        ([Attributes] extends [AttributeList[number]]
          ? unknown
          : "You havn't specified all the values in the union type you provided.")
    ) => {
      [Key in AttributeList[number]]: Props[Key];
    };
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

/**
 * The type of the render function that you must provide when calling the `extend`
 * function
 */

export type RenderFn<
  BaseComponent extends ExtendableComponentType,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> = (
  RootComponent: InnerRootComponent<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  props: ExtendedComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => ReactNode;

/**
 * The type of the render function that you must provide when calling the `extend`
 * function when you've specified child components
 */
export type RenderFnWithChildComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint,
  AdditionalProps extends object,
  RefType extends RefTypeConstraint,
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<BaseComponent>
> = (
  RootComponent: InnerRootComponent<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >,
  childComponents: {
    [Key in keyof FilterChildComponents<ChildComponents> as `${Capitalize<
      Key & string
    >}`]: InnerChildComponent<ChildComponents[Key]>;
  },
  props: ExtendedComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
) => ReactNode;

export type InnerRootOrChildComponent<
  Component extends ExtendableComponentType,
  OuterProps extends object
> = FC<ExtendableComponentProps<Component>> & {
  props: PropHelpers<OuterProps>;
};

/**
 * The type of the root component that is provided for use within the render function of
 * the `extend` function.
 */
export type InnerRootComponent<
  Component extends ExtendableComponentType,
  AdditionalProps extends object = {},
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<ExtendableComponentType> = keyof ExtendableComponentProps<Component>
> = InnerRootOrChildComponent<
  Component,
  ExtendedComponentProps<
    Component,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
>;

/**
 * The type of a child component that is provided for use within the render function of
 * the `extend` function.
 */
export type InnerChildComponent<Component extends ExtendableComponentType> =
  InnerRootOrChildComponent<Component, ExtendableComponentProps<Component>>;

/**
 * The props that should be added to the props of the resulting component
 * so that the users of the component can pass props to the child components.
 *
 */
type ChildComponentsAdditionalProps<
  ChildComponents extends ChildComponentsConstraint
> = {
  [Key in keyof FilterChildComponents<ChildComponents> as `${Uncapitalize<
    Key & string
  >}Props`]?: Partial<
    ExtendableComponentProps<FilterChildComponents<ChildComponents>[Key]>
  >;
};

/**
 * The type of the resulting component that is returned from the `extend` function
 */
export type ExtendedComponentProps<
  BaseComponent extends ExtendableComponentType,
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
  RefType extends 'default' ? never : 'ref'
> &
  (RefType extends 'default' ? {} : { ref?: Ref<RefType> });

/**
 * The type of the props of the resulting component that is returned from the `extend`
 * function when child components are specified
 */

export type ExtendedComponentWithChildComponentsProps<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint = {},
  AdditionalProps extends object = {},
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<ExtendableComponentType> = keyof ExtendableComponentProps<BaseComponent>
> = ExtendedComponentProps<
  BaseComponent,
  Omit<AdditionalProps, keyof ChildComponentsAdditionalProps<ChildComponents>> &
    ChildComponentsAdditionalProps<ChildComponents>,
  RefType,
  BaseComponentPropsToInclude
>;

/**
 * The type of the resulting component that is returned from the `extend` function
 */
export type ExtendedComponent<
  BaseComponent extends ExtendableComponentType,
  AdditionalProps extends object = {},
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<ExtendableComponentType> = keyof ExtendableComponentProps<BaseComponent>
> = FC<
  ExtendedComponentProps<
    BaseComponent,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
>;

/**
 * The type of the resulting component that is returned from the `extend` function
 * when child components are specified
 */
export type ExtendedComponentWithChildComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint = {},
  AdditionalProps extends object = {},
  RefType extends RefTypeConstraint = 'default',
  BaseComponentPropsToInclude extends BaseComponentPropsToIncludeConstraint<ExtendableComponentType> = keyof ExtendableComponentProps<BaseComponent>
> = FC<
  ExtendedComponentWithChildComponentsProps<
    BaseComponent,
    ChildComponents,
    AdditionalProps,
    RefType,
    BaseComponentPropsToInclude
  >
>;

/**
 * The type of the raw `extend` function (without any of the html element
 * shortcut functions defined on it)
 */

export type ComponentExtenderFn = {
  <BaseComponent extends ExtendableComponentType>(
    baseComponent: BaseComponent,
    propsMergeFn?: PropsMergeFn<BaseComponent>
  ): ComponentExtenderRenderFnProvider<BaseComponent>;
  <
    BaseComponent extends ExtendableComponentType,
    ChildComponents extends ChildComponentsConstraint
  >(
    baseComponent: BaseComponent,
    childComponents: ChildComponents,
    propsMergeFn?: PropsMergeFn<BaseComponent, ChildComponents>
  ): ComponentExtenderWithChildComponentsRenderFnProvider<
    BaseComponent,
    FilterChildComponents<ChildComponents>
  >;
};

/**
 * The type of the function that the `extend` function returns to you initially.
 * You must call this function with a render function to receive your final, resulting
 * component.
 *
 * @example
 *
 * const MyComponent: ComponentExtenderRenderFnProvider<'div'> = extend('div')
 *
 */
export type ComponentExtenderRenderFnProvider<
  BaseComponent extends ExtendableComponentType
> = <
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
) => ExtendedComponent<
  BaseComponent,
  AdditionalProps,
  RefType,
  BaseComponentPropsToInclude
>;

/**
 * The type of the function that the `extend` function returns to you initially when child components are specified.
 * You must call this function with a render function to receive your
 * final, resulting component.
 *
 * @example
 *
 * const MyComponent:
 * ComponentExtenderWithChildComponentsRenderFnProvider<
 *  'div',
 *  { MyChildComponent: 'div' }
 * > = extend('div', { MyChildComponent: 'div' })
 *
 */

export type ComponentExtenderWithChildComponentsRenderFnProvider<
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
) => ExtendedComponentWithChildComponents<
  BaseComponent,
  ChildComponents,
  AdditionalProps,
  RefType,
  BaseComponentPropsToInclude
>;

/**
 * The type of the `extend` function, complete with all the html element shortcut
 * functions defined on it. This is also the type returned from the the
 * `createCustomComponentExtender` function.
 */
export type ComponentExtender<
  AdditionalComponents extends ComponentExtender.AdditionalComponentsConstraint
> = ComponentExtenderFn & {
  Fragment: ComponentExtenderRenderFnProvider<typeof Fragment>;
} & {
  [Tag in (typeof allHtmlTags)[number]]: ComponentExtenderRenderFnProvider<Tag>;
} & {
  [ComponentKey in keyof AdditionalComponents]: ComponentExtenderRenderFnProvider<
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
