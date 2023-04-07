import { createContext, Provider, useMemo } from 'react';
import {
  ChildComponentsConstraint,
  ExtendableComponentType,
  FilterChildComponents,
  PropHelpers,
  RootOrChildComponent,
  ROOT_COMPONENT_LABEL,
} from '../../types';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { createInnerComponent } from './createInnerComponent';
import { getPropHelpers } from './getPropsHelpers';
import { PluckedPropInfo } from './initializePluckedProps';
import { InnerComponentsCommunicationContextValue } from './InnerComponentsCommunicationContextValue';

export function useInnerComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint
>(
  baseComponent: BaseComponent,
  childComponents: ChildComponents | undefined,
  getOuterProps: (label: string) => object,
  getPluckedPropsInfo: (label: string) => PluckedPropInfo
): {
  InnerComponentsCommunicationContextProvider: Provider<InnerComponentsCommunicationContextValue | null>;
  RootComponent: RootOrChildComponent<BaseComponent>;
  ChildComponents: {
    [K in keyof FilterChildComponents<ChildComponents> as Capitalize<
      K & string
    >]: RootOrChildComponent<FilterChildComponents<ChildComponents>[K]>;
  };
} {
  const getPropHelpersForComponent = (label: string): PropHelpers => {
    return getPropHelpers({
      outerProps: getOuterProps(label),
      pluckedPropsInfo: getPluckedPropsInfo(label),
    });
  };

  const InnerComponentsCommunicationContext = useCreateCommunicationContext();

  const RootComponent = useMemo(() => {
    return createInnerComponent(
      baseComponent,
      ROOT_COMPONENT_LABEL,
      InnerComponentsCommunicationContext
    );
  }, [InnerComponentsCommunicationContext, baseComponent]);

  (RootComponent as any).props =
    getPropHelpersForComponent(ROOT_COMPONENT_LABEL);

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

  for (const label in childComponents) {
    ChildComponents[capitalizeFirstLetter(label)].props =
      getPropHelpersForComponent(label);
  }

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
