import { forwardRef, ForwardRefRenderFunction, useContext } from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { MergeFunctionProviderContext } from '../MergeFunctionProvider';
import {
  ChildComponentsConstraint,
  ComponentExtenderFnGetter,
  ExtendableComponentType,
  PropsMergeFn,
  RootPropHelpers,
  ROOT_COMPONENT_LABEL,
} from '../types';
import { getChildComponentPropsNameProp } from './helpers/getChildComponentPropsNameProp';
import { getPropHelpers } from './helpers/getPropsHelpers';
import { initializePluckedProps } from './helpers/initializePluckedProps';
import { useInnerComponents } from './helpers/useInnerComponents';
import { usePropsGetter } from './helpers/usePropsGetter';

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
      const getPluckedPropsInfo = initializePluckedProps(
        childComponentsDeclaration
      );

      const mergeFunction =
        [
          extenderArgsMergeFn,
          extenderGetterPropsMergeFn,
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useContext(MergeFunctionProviderContext)?.propsMergeFn,
          defaultPropsMergeFn,
        ].find((x) => x != null) ?? defaultPropsMergeFn;

      const helpers: RootPropHelpers<any, {}, any, any, any> = {
        ...getPropHelpers({
          props: outerProps,
          ref: outerRef,
          pluckedPropsInfo: getPluckedPropsInfo(ROOT_COMPONENT_LABEL),
        }),
        forChild: (childName: string) => {
          const { ref, ...childProps } =
            outerProps[getChildComponentPropsNameProp(childName)] ?? {};
          return getPropHelpers({
            props: childProps,
            ref: ref,
            pluckedPropsInfo: getPluckedPropsInfo(childName),
          }) as any;
        },
      };

      const getProps = usePropsGetter(
        outerProps,
        outerRef,
        childComponentsDeclaration
      );

      const {
        RootComponent,
        ChildComponents,
        InnerComponentsCommunicationContextProvider,
      } = useInnerComponents(baseComponent, childComponentsDeclaration);

      return (
        <InnerComponentsCommunicationContextProvider
          value={{
            getProps,
            getPluckedPropsInfo,
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
        </InnerComponentsCommunicationContextProvider>
      );
    };
    return forwardRef(ReactExtendComponents_ResultComponent) as any;
  };
}) as any;
