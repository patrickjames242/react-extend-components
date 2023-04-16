import { createContext, Provider, useMemo } from 'react';
import {
  ChildComponentsConstraint,
  ExtendableComponentType,
  FilterChildComponents,
  InnerChildComponent,
  InnerRootComponent,
  PropHelpers,
  ROOT_COMPONENT_LABEL,
} from '../../types';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { createInnerComponent } from './createInnerComponent/createInnerComponent';
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
  getPluckedPropsInfo: (label: string) => PluckedPropInfo,
  resultingComponentDisplayName: string | undefined
): {
  InnerComponentsCommunicationContextProvider: Provider<InnerComponentsCommunicationContextValue | null>;
  RootComponent: InnerRootComponent<BaseComponent>;
  ChildComponents: {
    [K in keyof FilterChildComponents<ChildComponents> as Capitalize<
      K & string
    >]: InnerChildComponent<FilterChildComponents<ChildComponents>[K]>;
  };
} {
  const getPropHelpersForComponent = (label: string): PropHelpers => {
    return getPropHelpers({
      outerProps: getOuterProps(label),
      pluckedPropsInfo: getPluckedPropsInfo(label),
    });
  };

  const InnerComponentsCommunicationContext = useCreateCommunicationContext(
    resultingComponentDisplayName
  );

  const RootComponent = useMemo(() => {
    return createInnerComponent(
      baseComponent,
      ROOT_COMPONENT_LABEL,
      InnerComponentsCommunicationContext,
      resultingComponentDisplayName
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [InnerComponentsCommunicationContext]);

  (RootComponent as any).props =
    getPropHelpersForComponent(ROOT_COMPONENT_LABEL);

  const ChildComponents = useMemo(() => {
    const resultObj: any = {};
    if (childComponents) {
      for (const key in childComponents) {
        resultObj[capitalizeFirstLetter(key)] = createInnerComponent(
          childComponents[key]!,
          key,
          InnerComponentsCommunicationContext,
          resultingComponentDisplayName
        );
      }
    }
    return resultObj;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [InnerComponentsCommunicationContext]);

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

function useCreateCommunicationContext(
  resultingComponentDisplayName: string | undefined
): React.Context<InnerComponentsCommunicationContextValue | null> {
  return useMemo(() => {
    const context =
      createContext<InnerComponentsCommunicationContextValue | null>(null);
    if (resultingComponentDisplayName == null) {
      context.displayName =
        'ReactExtendComponents_InnerComponentsCommunicationContext_' +
        getUniqueNumber();
    } else {
      context.displayName =
        resultingComponentDisplayName +
        '.' +
        'InnerComponentsCommunicationContext';
    }
    return context;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const getUniqueNumber = (() => {
  let prev = 0;
  return () => {
    return ++prev;
  };
})();
