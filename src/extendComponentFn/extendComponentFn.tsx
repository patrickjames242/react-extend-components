import { forwardRef, ForwardRefRenderFunction, useContext } from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { MergeFunctionProviderContext } from '../MergeFunctionProvider';
import {
  CanHaveExtendableComponentInfo,
  ChildComponentsConstraint,
  ComponentExtenderFn,
  ExtendableComponentInfo,
  ExtendableComponentType,
  EXTENDABLE_COMPONENT_INFO,
  PropPath,
  PropsMergeFn,
} from '../types';
import { forEachExtendableComponentChild } from '../utils/forEachExtendableComponentChild';
import { getChildComponentPropsNameProp } from '../utils/getChildComponentPropsNameProp';
import { normalizePropPath } from '../utils/normalizePropPath';
import { initializePluckedProps } from './helpers/initializePluckedProps';
import { useInnerComponents } from './helpers/useInnerComponents';
import { useOuterPropsForInnerComponentGetter } from './helpers/usePropsGetter';

///TODO: add display name param to extendComponentFn

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
    const resultComponent = forwardRef(
      ReactExtendComponents_ResultComponent
    ) as CanHaveExtendableComponentInfo;

    const childComponentPropInfoObjs = (() => {
      const result: ExtendableComponentInfo.ChildComponent[] = [];
      function appendChildComponentInfoFromComponent(
        component: ExtendableComponentType,
        currentPath: PropPath
      ): void {
        forEachExtendableComponentChild(component, (child) => {
          result.push({
            ...child,
            propPath: [
              ...normalizePropPath(currentPath),
              ...normalizePropPath(child.propPath),
            ],
          });
        });
      }
      appendChildComponentInfoFromComponent(baseComponent, []);
      for (const child in childComponentsDeclaration) {
        appendChildComponentInfoFromComponent(
          childComponentsDeclaration[child]!,
          getChildComponentPropsNameProp(child)
        );
        result.push({
          propPath: getChildComponentPropsNameProp(child),
          type: childComponentsDeclaration[child]!,
        });
      }
      return result;
    })();

    resultComponent[EXTENDABLE_COMPONENT_INFO] = {
      childComponents: childComponentPropInfoObjs,
    };
    return resultComponent;
  };
}) as any;
