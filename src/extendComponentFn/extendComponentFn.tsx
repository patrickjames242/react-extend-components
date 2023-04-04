import {
  createContext,
  forwardRef,
  ForwardRefRenderFunction,
  useMemo,
  useRef,
} from 'react';
import { createRootAndChildComponents } from '../helpers/createRootAndChildComponents';
import { getChildComponentPropsNameProp } from '../helpers/getChildComponentPropsNameProp';
import { getPropHelpers } from '../helpers/getPropsHelpers';
import { InnerComponentsCommunicationContextValue } from '../helpers/InnerComponentsCommunicationContextValue';
import { initializePluckedPropInfoMap } from '../helpers/PluckedPropInfo';
import { MergeFunctionProvider } from '../MergeFunctionProvider';
import {
  ChildComponentsConstraint,
  ComponentExtenderFnGetter,
  ExtendableComponentType,
  PropsMergeFn,
  RootPropHelpers,
  ROOT_COMPONENT_LABEL,
} from '../types';

const getUniqueNumber = (() => {
  let prev = 0;
  return () => {
    return ++prev;
  };
})();

export const extendComponentFn: ComponentExtenderFnGetter = ((
  baseComponent: ExtendableComponentType,
  childComponentsOrPropsMergeFn?:
    | PropsMergeFn
    | ChildComponentsConstraint
    | undefined,
  propsMergeFn?: PropsMergeFn | undefined
) => {
  const { childComponentsDeclaration, extenderGetterPropsMergeFn } = (() => {
    if (typeof childComponentsOrPropsMergeFn === 'object') {
      return {
        childComponentsDeclaration: childComponentsOrPropsMergeFn,
        extenderGetterPropsMergeFn: propsMergeFn,
      };
    } else {
      return {
        childComponentsDeclaration: undefined,
        extenderGetterPropsMergeFn: childComponentsOrPropsMergeFn,
      };
    }
  })();

  return (renderFn: any, propsMergeFn?: PropsMergeFn<any, any, any, any>) => {
    const extenderArgsMergeFn = propsMergeFn;

    const ReactExtendComponents_ResultComponent: ForwardRefRenderFunction<
      any,
      any
    > = (outerProps, outerRef) => {
      const pluckedPropsInfoObj = initializePluckedPropInfoMap(
        childComponentsDeclaration ?? {}
      );

      const mergeFn = extenderArgsMergeFn ?? extenderGetterPropsMergeFn;

      const helpers: RootPropHelpers<any, {}, any, any, any> = {
        ...getPropHelpers({
          props: outerProps,
          ref: outerRef,
          pluckedPropsInfo: pluckedPropsInfoObj[ROOT_COMPONENT_LABEL],
        }),
        forChild: (childName: string) => {
          const childProps =
            outerProps[getChildComponentPropsNameProp(childName)] ?? {};
          return getPropHelpers({
            props: childProps,
            ref: childProps['ref'],
            pluckedPropsInfo: pluckedPropsInfoObj[childName]!,
          }) as any;
        },
      };

      const getProps: InnerComponentsCommunicationContextValue['getProps'] = (
        label
      ) => {
        if (label === ROOT_COMPONENT_LABEL) {
          const outerPropsCopy = { ...outerProps };
          if (childComponentsDeclaration) {
            for (const label in childComponentsDeclaration) {
              delete outerPropsCopy[getChildComponentPropsNameProp(label)];
            }
          }
          return outerPropsCopy;
        } else {
          return outerProps[getChildComponentPropsNameProp(label)] ?? {};
        }
      };

      const InnerComponentsCommunicationContext = useRef(
        useMemo(() => {
          const context =
            createContext<InnerComponentsCommunicationContextValue | null>(
              null
            );
          context.displayName =
            'ReactExtendComponents_InnerComponentsCommunicationContext_' +
            getUniqueNumber();
          return context;
        }, [])
      ).current;

      const { RootComponent, ChildComponents } = useRef(
        useMemo(() => {
          const { root: RootComponent, ...ChildComponents } =
            createRootAndChildComponents(
              baseComponent,
              childComponentsDeclaration,
              InnerComponentsCommunicationContext
            );
          return { RootComponent, ChildComponents };
        }, [InnerComponentsCommunicationContext])
      ).current;

      return (
        <MergeFunctionProvider propsMergeFn={mergeFn}>
          <InnerComponentsCommunicationContext.Provider
            value={{
              getProps,
              pluckedPropsInfoObj,
              outerRef,
            }}
          >
            {childComponentsDeclaration
              ? renderFn(
                  RootComponent as any,
                  ChildComponents as any,
                  helpers.detectPlucked(),
                  helpers
                )
              : renderFn(
                  RootComponent as any,
                  helpers.detectPlucked(),
                  helpers
                )}
          </InnerComponentsCommunicationContext.Provider>
        </MergeFunctionProvider>
      );
    };
    return forwardRef(ReactExtendComponents_ResultComponent) as any;
  };
}) as any;
