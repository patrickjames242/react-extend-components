import {
  createContext,
  forwardRef,
  ForwardRefRenderFunction,
  useContext,
  useMemo,
  useRef,
} from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { createRootAndChildComponents } from '../helpers/createRootAndChildComponents';
import { getChildComponentPropsNameProp } from '../helpers/getChildComponentPropsNameProp';
import { getPropHelpers } from '../helpers/getPropsHelpers';
import { InnerComponentsCommunicationContextValue } from '../helpers/InnerComponentsCommunicationContextValue';
import { initializePluckedPropInfoMap } from '../helpers/PluckedPropInfo';
import { MergeFunctionProviderContext } from '../MergeFunctionProvider';
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

      const mergeFunction = (() => {
        const mergeFunctionsByPriority = [
          extenderArgsMergeFn,
          extenderGetterPropsMergeFn,
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useContext(MergeFunctionProviderContext)?.propsMergeFn,
          defaultPropsMergeFn,
        ];

        return (
          mergeFunctionsByPriority.find((x) => x != null) ?? defaultPropsMergeFn
        );
      })();

      const helpers: RootPropHelpers<any, {}, any, any, any> = {
        ...getPropHelpers({
          props: outerProps,
          ref: outerRef,
          pluckedPropsInfo: pluckedPropsInfoObj[ROOT_COMPONENT_LABEL],
        }),
        forChild: (childName: string) => {
          const { ref, ...childProps } =
            outerProps[getChildComponentPropsNameProp(childName)] ?? {};
          return getPropHelpers({
            props: childProps,
            ref: ref,
            pluckedPropsInfo: pluckedPropsInfoObj[childName]!,
          }) as any;
        },
      };

      const getProps: InnerComponentsCommunicationContextValue['getProps'] = (
        label
      ) => {
        if (label === ROOT_COMPONENT_LABEL) {
          const outerPropsCopy = { ...outerProps };
          delete outerPropsCopy.ref;
          if (outerRef) outerPropsCopy.ref = outerRef;
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
        <InnerComponentsCommunicationContext.Provider
          value={{
            getProps,
            pluckedPropsInfoObj,
            mergeFunction,
          }}
        >
          {childComponentsDeclaration
            ? renderFn(
                RootComponent as any,
                ChildComponents as any,
                helpers.detectPlucked(),
                helpers
              )
            : renderFn(RootComponent as any, helpers.detectPlucked(), helpers)}
        </InnerComponentsCommunicationContext.Provider>
      );
    };
    return forwardRef(ReactExtendComponents_ResultComponent) as any;
  };
}) as any;
