import { useMemo } from 'react';
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
import { InnerComponentsCommunicationValue } from './InnerComponentsCommunicationContextValue';
import { ValueObservable } from './ValueObservable';

export function useInnerComponents<
  BaseComponent extends ExtendableComponentType,
  ChildComponents extends ChildComponentsConstraint
>(
  baseComponent: BaseComponent,
  childComponents: ChildComponents | undefined,
  getOuterProps: (label: string) => object,
  getPluckedPropsInfo: (label: string) => PluckedPropInfo,
  resultingComponentDisplayName: string | undefined,
  innerComponentsCommunicationObservable: ValueObservable<InnerComponentsCommunicationValue>
): {
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

  const RootComponent = useMemo(() => {
    return createInnerComponent(
      baseComponent,
      ROOT_COMPONENT_LABEL,
      innerComponentsCommunicationObservable,
      resultingComponentDisplayName
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  (RootComponent as any).props =
    getPropHelpersForComponent(ROOT_COMPONENT_LABEL);

  const ChildComponents = useMemo(() => {
    const resultObj: any = {};
    if (childComponents) {
      for (const key in childComponents) {
        resultObj[capitalizeFirstLetter(key)] = createInnerComponent(
          childComponents[key]!,
          key,
          innerComponentsCommunicationObservable,
          resultingComponentDisplayName
        );
      }
    }
    return resultObj;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  for (const label in childComponents) {
    ChildComponents[capitalizeFirstLetter(label)].props =
      getPropHelpersForComponent(label);
  }

  return useMemo(
    () => ({
      RootComponent: RootComponent as any,
      ChildComponents: ChildComponents,
    }),
    [ChildComponents, RootComponent]
  );
}
