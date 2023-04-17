import {
  ComponentType,
  createElement,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';
import {
  ExtendableComponentProps,
  ExtendableComponentType,
} from '../../../types';
import { capitalizeFirstLetter } from '../../../utils/capitalizeFirstLetter';
import { forEachExtendableComponentChild } from '../../../utils/forEachExtendableComponentChild';
import { InnerComponentsCommunicationValue } from '../InnerComponentsCommunicationContextValue';
import { useConsumeObservableValue, ValueObservable } from '../ValueObservable';
import { setAtPath } from './getAndSetAtPath';
import { getPropsMerger } from './getPropsMerger';

export function createInnerComponent<Component extends ExtendableComponentType>(
  component: Component,
  componentLabel: string,
  communicationObservable: ValueObservable<InnerComponentsCommunicationValue>,
  resultingComponentDisplayName: string | undefined
): ComponentType<ExtendableComponentProps<Component>> {
  const ReactExtendComponents_RootOrChildComponent: ForwardRefRenderFunction<
    any,
    ExtendableComponentProps<Component>
  > = (innerProps, innerRef) => {
    const {
      getOuterProps: getProps,
      getPluckedPropsInfo,
      mergeFunction,
    } = useConsumeObservableValue(communicationObservable);

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

  const resultingComponent = forwardRef(
    ReactExtendComponents_RootOrChildComponent
  );

  if (resultingComponentDisplayName != null) {
    resultingComponent.displayName =
      resultingComponentDisplayName +
      '.' +
      capitalizeFirstLetter(componentLabel);
  }

  return resultingComponent;
}
