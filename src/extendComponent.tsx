import { forwardRef, ForwardRefRenderFunction } from 'react';
import { createRootAndChildComponents } from './helpers/createRootAndChildComponents';
import { getChildComponentPropsNameProp } from './helpers/getChildComponentPropsNameProp';
import { getPropHelpers } from './helpers/getPropsHelpers';
import { initializePluckedPropInfoMap } from './helpers/PluckedPropInfo';
import {
  __RootComponentCommunicationContext,
  __RootComponentCommunicationContextValue,
} from './helpers/__RootComponentCommunicationContext';
import { MergeFunctionProvider } from './MergeFunctionProvider';
import {
  ChildComponentsConstraint,
  ComponentExtenderGetter,
  ExtendableComponentType,
  PropsMergeFn,
  RootPropHelpers,
  ROOT_COMPONENT_LABEL,
} from './types';
import { uncapitalizeFirstLetter } from './utils/uncapitalizeFirstLetter';

export const extendComponent: ComponentExtenderGetter = ((
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

  const { root: RootComponent, ...ChildComponents } =
    createRootAndChildComponents(baseComponent, childComponentsDeclaration);

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
            outerProps[uncapitalizeFirstLetter(childName) + 'Props'] ?? {};
          return getPropHelpers({
            props: childProps,
            ref: childProps['ref'],
            pluckedPropsInfo: pluckedPropsInfoObj[childName]!,
          }) as any;
        },
      };

      const getProps: __RootComponentCommunicationContextValue['getProps'] = (
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

      return (
        <MergeFunctionProvider propsMergeFn={mergeFn}>
          <__RootComponentCommunicationContext.Provider
            value={{ getProps, pluckedPropsInfoObj, outerRef }}
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
          </__RootComponentCommunicationContext.Provider>
        </MergeFunctionProvider>
      );
    };
    return forwardRef(ReactExtendComponents_ResultComponent) as any;
  };
}) as any;
