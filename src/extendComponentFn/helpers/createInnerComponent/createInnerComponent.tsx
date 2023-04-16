import {
  ComponentType,
  Context,
  createElement,
  forwardRef,
  ForwardRefRenderFunction,
  useContext,
} from 'react';
import {
  ExtendableComponentProps,
  ExtendableComponentType,
} from '../../../types';
import { forEachExtendableComponentChild } from '../../../utils/forEachExtendableComponentChild';
import { InnerComponentsCommunicationContextValue } from '../InnerComponentsCommunicationContextValue';
import { setAtPath } from './getAndSetAtPath';
import { getPropsMerger } from './getPropsMerger';

export function createInnerComponent<Component extends ExtendableComponentType>(
  component: Component,
  componentLabel: string,
  communicationContext: Context<InnerComponentsCommunicationContextValue | null>
): ComponentType<ExtendableComponentProps<Component>> {
  const ReactExtendComponents_RootOrChildComponent: ForwardRefRenderFunction<
    any,
    ExtendableComponentProps<Component>
  > = (innerProps, innerRef) => {
    const communicationContextValue = useContext(communicationContext);
    if (!communicationContextValue) {
      throw new Error(
        "You cannot use the root or child component of an extended component outside it's render function."
      );
    }
    const {
      getOuterProps: getProps,
      getPluckedPropsInfo,
      mergeFunction,
    } = communicationContextValue!;

    const rootOuterProps = getProps(componentLabel);
    const pluckedProps = getPluckedPropsInfo(componentLabel);

    if (pluckedProps == null) {
      throw new Error(
        `could not find the plucked props object for the component with the label ${componentLabel}`
      );
    }

    const getMergedPropsObjAtPath = getPropsMerger({
      underlyingComponent: component,
      pluckedProps,
      rootOuterProps,
      innerProps,
      innerRef,
      mergeFunction,
      componentLabel,
    });

    const rootProps = getMergedPropsObjAtPath([], component);

    forEachExtendableComponentChild(component, (child) => {
      const mergedProps = getMergedPropsObjAtPath(child.propPath, child.type);
      setAtPath(rootProps, child.propPath, mergedProps);
    });

    return createElement(component, rootProps);
  };

  return forwardRef(ReactExtendComponents_RootOrChildComponent);
}
