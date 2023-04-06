import { createContext, Provider, useMemo } from 'react';

import {
  ChildComponentsConstraint,
  ExtendableComponentProps,
  ExtendableComponentType,
  FilterChildComponents,
  ROOT_COMPONENT_LABEL,
} from '../../types';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { createInnerComponent } from './createInnerComponent';
import { InnerComponentsCommunicationContextValue } from './InnerComponentsCommunicationContextValue';

export function useInnerComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint
>(
  baseComponent: BaseComponent,
  childComponents: ChildComponents | undefined
): {
  InnerComponentsCommunicationContextProvider: Provider<InnerComponentsCommunicationContextValue | null>;
  RootComponent: ExtendableComponentProps<BaseComponent>;
  ChildComponents: {
    [K in keyof FilterChildComponents<ChildComponents> as Capitalize<
      K & string
    >]: FilterChildComponents<ChildComponents>[K];
  };
} {
  const InnerComponentsCommunicationContext = useCreateCommunicationContext();

  const RootComponent = useMemo(() => {
    return createInnerComponent(
      baseComponent,
      ROOT_COMPONENT_LABEL,
      InnerComponentsCommunicationContext
    );
  }, [InnerComponentsCommunicationContext, baseComponent]);

  const ChildComponents = useMemo(() => {
    const resultObj: any = {};
    if (childComponents) {
      for (const key in childComponents) {
        resultObj[capitalizeFirstLetter(key)] = createInnerComponent(
          childComponents[key]!,
          key,
          InnerComponentsCommunicationContext
        );
      }
    }
    return resultObj;
  }, [InnerComponentsCommunicationContext, childComponents]);

  return useMemo(
    () => ({
      RootComponent: RootComponent as any,
      ChildComponents: ChildComponents,
      InnerComponentsCommunicationContextProvider:
        InnerComponentsCommunicationContext.Provider,
    }),
    [
      ChildComponents,
      InnerComponentsCommunicationContext.Provider,
      RootComponent,
    ]
  );
}

function useCreateCommunicationContext(): React.Context<InnerComponentsCommunicationContextValue | null> {
  return useMemo(() => {
    const context =
      createContext<InnerComponentsCommunicationContextValue | null>(null);
    context.displayName =
      'ReactExtendComponents_InnerComponentsCommunicationContext_' +
      getUniqueNumber();
    return context;
  }, []);
}

const getUniqueNumber = (() => {
  let prev = 0;
  return () => {
    return ++prev;
  };
})();
