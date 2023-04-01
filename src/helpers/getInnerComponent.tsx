import {
  ComponentType,
  createElement,
  forwardRef,
  ForwardRefRenderFunction,
  useContext,
} from 'react';
import { defaultPropsMergeFn } from '../defaultPropsMergeFn';
import { MergeFunctionProviderContext } from '../MergeFunctionProvider';
import { ExtendableComponentProps, ExtendableComponentType } from '../types';
import { __RootComponentCommunicationContext } from './__RootComponentCommunicationContext';

export function getInnerComponent<Component extends ExtendableComponentType>(
  component: Component,
  componentLabel: string
): ComponentType<ExtendableComponentProps<Component>> {
  const ReactExtendComponents_RootOrChildComponent: ForwardRefRenderFunction<
    any,
    ExtendableComponentProps<Component>
  > = (innerProps, innerRef) => {
    const rootComponentCommunicationContext = useContext(
      __RootComponentCommunicationContext
    );
    if (!rootComponentCommunicationContext) {
      throw new Error(
        "You cannot use the root or child component of an extended component outside it's render function."
      );
    }
    const { getProps, outerRef, pluckedPropsInfoObj } =
      rootComponentCommunicationContext!;

    const outerProps = getProps(componentLabel);

    const pluckedProps = pluckedPropsInfoObj[componentLabel];
    if (pluckedProps == null) {
      throw new Error(
        `could not fined the plucked props object for the component with the label${componentLabel}`
      );
    }

    const preparedOuterProps = (() => {
      if (pluckedProps.areAllPropsPlucked()) return {};
      const outer: any = {
        ...outerProps,
      };
      delete outer.ref; // because react annoyingly adds a ref getter and setter to props that throws errors to remind us not to try to access it there
      outerRef && (outer.ref = outerRef);
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

    const mergeFn =
      useContext(MergeFunctionProviderContext)!.propsMergeFn ??
      defaultPropsMergeFn;

    const mergedProps = mergeFn({
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
