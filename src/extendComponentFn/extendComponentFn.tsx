import { ForwardRefRenderFunction, useContext } from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { MergeFunctionProviderContext } from '../MergeFunctionProvider';
import {
  ChildComponentsConstraint,
  ComponentExtenderFn,
  ExtendableComponentType,
  PropsMergeFn,
} from '../types';
import { forwardRefAndDisplayName } from '../utils/forwardRefAndDisplayName';
import { initializePluckedProps } from './helpers/initializePluckedProps';
import { InnerComponentsCommunicationValue } from './helpers/InnerComponentsCommunicationContextValue';
import { setExtendableComponentInfoOnResultingComponent } from './helpers/setExtendableComponentInfoOnResultingComponent';
import { useInnerComponents } from './helpers/useInnerComponents';
import { useOuterPropsForInnerComponentGetter } from './helpers/usePropsGetter';
import { useCreateValueObservable } from './helpers/ValueObservable';

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

      const innerComponentsCommunicationObservable =
        useCreateValueObservable<InnerComponentsCommunicationValue>({
          getOuterProps: getOuterPropsForInnerComponent,
          getPluckedPropsInfo,
          mergeFunction,
        });

      const { RootComponent, ChildComponents } = useInnerComponents(
        baseComponent,
        childComponentsDeclaration,
        getOuterPropsForInnerComponent,
        getPluckedPropsInfo,
        resultComponent.displayName,
        innerComponentsCommunicationObservable
      );

      const detectPropsObj = RootComponent.props.detectPlucked();

      return childComponentsDeclaration
        ? renderFn(RootComponent as any, ChildComponents as any, detectPropsObj)
        : renderFn(RootComponent as any, detectPropsObj);
    };

    const resultComponent = forwardRefAndDisplayName(
      ReactExtendComponents_ResultComponent
    );

    setExtendableComponentInfoOnResultingComponent(
      baseComponent,
      resultComponent,
      childComponentsDeclaration
    );
    return resultComponent;
  };
}) as any;
