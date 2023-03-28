import {
  createContext,
  createElement,
  forwardRef,
  ForwardRefRenderFunction,
  useContext,
  useMemo,
} from 'react';
import { defaultPropsMergeFn } from './defaultPropsMergeFn';
import {
  MergeFunctionProvider,
  MergeFunctionProviderContext,
} from './MergeFunctionProvider';
import {
  BaseComponentPropsToIncludeConstraint,
  ComponentExtenderGetter,
  ExtendableComponentProps,
  ExtendableComponentType,
  PropHelpers,
  PropsMergeFn,
  RefTypeConstraint,
  RenderFn,
  ResultComponentProps,
  RootComponent,
} from './types';

interface __RootComponentCommunicationContextValue {
  pluckAllProps: { pluckAllProps: boolean };
  pluckedProps: Set<string | number | symbol>;
  outerProps: object;
}

const __RootComponentCommunicationContext =
  createContext<__RootComponentCommunicationContextValue | null>(null);

export const extendComponent: ComponentExtenderGetter = <
  BaseComponent extends ExtendableComponentType
>(
  baseComponent: BaseComponent,
  propsMergeFn?: PropsMergeFn<BaseComponent>
) => {
  const extenderGetterPropsMergeFn = propsMergeFn;
  return <
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
      AdditionalProps,
      RefType,
      BaseComponentPropsToInclude
    >
  ) => {
    const extenderArgsMergeFn = propsMergeFn;
    const Fn: ForwardRefRenderFunction<
      ExtendableComponentProps<ExtendableComponentType>['ref'],
      ResultComponentProps<
        BaseComponent,
        AdditionalProps,
        RefType,
        BaseComponentPropsToInclude
      >
    > = (outerProps, outerRef) => {
      const pluckedProps = new Set<string | number | symbol>();
      const pluckAllProps = { pluckAllProps: false }; // we need this to be a reference to an object so that we can mutate it in the pluckAll function

      const RootComponentFn: RootComponent<BaseComponent> = useMemo(
        () => {
          const Fn: ForwardRefRenderFunction<
            ExtendableComponentProps<BaseComponent>['ref'],
            ExtendableComponentProps<BaseComponent>
          > = (innerProps, innerRef) => {
            const rootComponentCommunicationContext = useContext(
              __RootComponentCommunicationContext
            );
            if (!rootComponentCommunicationContext) {
              throw new Error(
                "You cannot use the RootComponent of an extended component outside it's render function."
              );
            }
            const { outerProps, pluckedProps, pluckAllProps } =
              rootComponentCommunicationContext!;

            const preparedOuterProps = (() => {
              if (pluckAllProps.pluckAllProps) return {};
              const outer: any = {
                ...outerProps,
              };
              delete outer.ref; // because react annoyingly adds a ref getter and setter to props that throws errors to remind us not to try to access it there
              outerRef && (outer.ref = outerRef);
              for (const key of pluckedProps) {
                delete outer[key];
              }
              return outer;
            })();

            const preparedInnerProps = (() => {
              const inner: any = { ...innerProps };
              delete inner.ref; // because react annoyingly adds a ref getter and setter to props that throws errors to remind us not to try to access it there
              innerRef && (inner.ref = innerRef);
              return inner;
            })();

            const mergeFn =
              useContext(MergeFunctionProviderContext)!.propsMergeFn ??
              defaultPropsMergeFn;

            const mergedProps = mergeFn({
              innerProps: preparedInnerProps,
              outerProps: preparedOuterProps,
              defaultMergeFn: defaultPropsMergeFn,
            });

            return createElement(baseComponent, mergedProps);
          };
          return forwardRef(Fn) as any;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );

      const pluck: PropHelpers<
        BaseComponent,
        AdditionalProps,
        RefType,
        BaseComponentPropsToInclude
      >['pluck'] = (...attributes) => {
        return attributes.reduce((acc, attribute) => {
          pluckedProps.add(attribute);
          if (attribute === 'ref') {
            acc[attribute] = outerRef;
          } else {
            acc[attribute] = (outerProps as any)[attribute];
          }
          return acc;
        }, {} as any);
      };

      const detectPlucked: PropHelpers<
        BaseComponent,
        AdditionalProps,
        RefType,
        BaseComponentPropsToInclude
      >['detectPlucked'] = () => {
        const result: any = {};

        for (const key in outerProps) {
          Object.defineProperty(result, key, {
            get: () => {
              pluckedProps.add(key);
              return (outerProps as any)[key];
            },
          });
        }

        Object.defineProperty(result, 'ref', {
          get: () => {
            pluckedProps.add('ref');
            return outerRef;
          },
        });

        return result;
      };

      const peek: PropHelpers<
        BaseComponent,
        AdditionalProps,
        RefType,
        BaseComponentPropsToInclude
      >['peek'] = () => {
        const props = { ...outerProps };
        delete props['ref']; // because react annoyingly adds a ref getter and setter to props to remind us not to try to access it there
        if (outerRef) props.ref = outerRef;
        return props;
      };

      const pluckAll: PropHelpers<
        BaseComponent,
        AdditionalProps,
        RefType,
        BaseComponentPropsToInclude
      >['pluckAll'] = () => {
        pluckAllProps.pluckAllProps = true;
        return peek();
      };

      const mergeFn = extenderArgsMergeFn ?? extenderGetterPropsMergeFn;
      return (
        <MergeFunctionProvider propsMergeFn={mergeFn}>
          <__RootComponentCommunicationContext.Provider
            value={{ outerProps, pluckedProps, pluckAllProps }}
          >
            {renderFn(RootComponentFn, detectPlucked(), {
              pluckAll,
              pluck,
              peek,
              detectPlucked,
            })}
          </__RootComponentCommunicationContext.Provider>
        </MergeFunctionProvider>
      );
    };
    return forwardRef(Fn) as any;
  };
};
