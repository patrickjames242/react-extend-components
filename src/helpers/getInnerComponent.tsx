import {
  ComponentType,
  Context,
  createElement,
  forwardRef,
  ForwardRefRenderFunction,
  useContext,
} from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { ExtendableComponentProps, ExtendableComponentType } from '../types';
import { InnerComponentsCommunicationContextValue } from './InnerComponentsCommunicationContextValue';

export function getInnerComponent<Component extends ExtendableComponentType>(
  component: Component,
  componentLabel: string,
  communicationContext: Context<InnerComponentsCommunicationContextValue | null>
): ComponentType<ExtendableComponentProps<Component>> {
  const ReactExtendComponents_RootOrChildComponent: ForwardRefRenderFunction<
    any,
    ExtendableComponentProps<Component>
  > = (innerProps, innerRef) => {
    const rootComponentCommunicationContext = useContext(communicationContext);
    if (!rootComponentCommunicationContext) {
      throw new Error(
        "You cannot use the root or child component of an extended component outside it's render function."
      );
    }
    const { getProps, pluckedPropsInfoObj, mergeFunction } =
      rootComponentCommunicationContext!;

    const outerProps = getProps(componentLabel);

    const pluckedProps = pluckedPropsInfoObj[componentLabel];
    if (pluckedProps == null) {
      throw new Error(
        `could not find the plucked props object for the component with the label ${componentLabel}`
      );
    }

    const preparedOuterProps = (() => {
      if (pluckedProps.areAllPropsPlucked()) return {};
      const outer: any = {
        ...outerProps,
      };
      for (const key of pluckedProps.getAllPluckedProps()) {
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

    const mergedProps = mergeFunction({
      innerProps: preparedInnerProps,
      outerProps: preparedOuterProps,
      defaultMergeFn: defaultPropsMergeFn,
      label: componentLabel,
      type: component,
    });

    return createElement(component, mergedProps);
  };

  return forwardRef(ReactExtendComponents_RootOrChildComponent);
}
