import { forwardRef, ForwardRefRenderFunction, useContext } from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { MergeFunctionProviderContext } from '../MergeFunctionProvider';
import {
  ChildComponentsConstraint,
  ComponentExtenderFn,
  ExtendableComponentType,
  PropsMergeFn,
} from '../types';
import { initializePluckedProps } from './helpers/initializePluckedProps';
import { useInnerComponents } from './helpers/useInnerComponents';
import { useOuterPropsForInnerComponentGetter } from './helpers/usePropsGetter';

export const extendComponentFn: ComponentExtenderFn = ((
  baseComponent: ExtendableComponentType,
  childComponentsOrPropsMergeFn?:
    | PropsMergeFn
    | ChildComponentsConstraint
    | undefined,
  propsMergeFn?: PropsMergeFn | undefined
) => {
  const { childComponentsDeclaration, topLevelExtendFunctionPropsMergeFn } =
    (() => {
      if (typeof childComponentsOrPropsMergeFn === 'object') {
        return {
          childComponentsDeclaration: childComponentsOrPropsMergeFn,
          topLevelExtendFunctionPropsMergeFn: propsMergeFn,
        };
      } else {
        return {
          childComponentsDeclaration: undefined,
          topLevelExtendFunctionPropsMergeFn: childComponentsOrPropsMergeFn,
        };
      }
    })();

  return (renderFn: any, propsMergeFn?: PropsMergeFn<any, any, any, any>) => {
    const extenderRenderProviderMergeFn = propsMergeFn;

    const ReactExtendComponents_ResultComponent: ForwardRefRenderFunction<
      any,
      any
    > = (outerProps, outerRef) => {
      const getPluckedPropsInfo = initializePluckedProps(
        childComponentsDeclaration
      );

      const mergeFunctionProviderValue = useContext(
        MergeFunctionProviderContext
      );

      const mergeFunction =
        extenderRenderProviderMergeFn ??
        topLevelExtendFunctionPropsMergeFn ??
        mergeFunctionProviderValue?.propsMergeFn ??
        defaultPropsMergeFn;

      const getOuterPropsForInnerComponent =
        useOuterPropsForInnerComponentGetter(
          outerProps,
          outerRef,
          childComponentsDeclaration
        );

      const {
        RootComponent,
        ChildComponents,
        InnerComponentsCommunicationContextProvider,
      } = useInnerComponents(
        baseComponent,
        childComponentsDeclaration,
        getOuterPropsForInnerComponent,
        getPluckedPropsInfo
      );

      const detectPropsObj = RootComponent.props.detectPlucked();

      return (
        <InnerComponentsCommunicationContextProvider
          value={{
            getOuterProps: getOuterPropsForInnerComponent,
            getPluckedPropsInfo,
            mergeFunction,
          }}
        >
          {childComponentsDeclaration
            ? renderFn(
                RootComponent as any,
                ChildComponents as any,
                detectPropsObj
              )
            : renderFn(RootComponent as any, detectPropsObj)}
        </InnerComponentsCommunicationContextProvider>
      );
    };
    return forwardRef(ReactExtendComponents_ResultComponent) as any;
  };
}) as any;
