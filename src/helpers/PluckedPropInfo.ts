import {
  ChildComponentsConstraint,
  FilterChildComponents,
  ROOT_COMPONENT_LABEL,
} from '../types';

export interface PluckedPropInfo {
  isPropPlucked: (prop: string | number | symbol) => boolean;
  areAllPropsPlucked: () => boolean;
  getAllPluckedProps: () => (string | number | symbol)[];
  pluckProp: (prop: string | number | symbol) => void;
  pluckAllProps: () => void;
}

function initializePluckedPropInfo(): PluckedPropInfo {
  const pluckedProps = new Set<string | number | symbol>();
  let pluckAllProps = false;

  return {
    areAllPropsPlucked: () => pluckAllProps,
    isPropPlucked: (prop) => pluckAllProps || pluckedProps.has(prop),
    pluckProp: (prop) => pluckedProps.add(prop),
    pluckAllProps: () => (pluckAllProps = true),
    getAllPluckedProps: () => [...pluckedProps],
  };
}

export function initializePluckedPropInfoMap<
  ChildComponents extends ChildComponentsConstraint
>(
  childComponents: ChildComponents
): { [ROOT_COMPONENT_LABEL]: PluckedPropInfo } & Record<
  keyof FilterChildComponents<ChildComponents>,
  PluckedPropInfo
> {
  const returnVal: any = {};
  for (const childKey in childComponents) {
    returnVal[childKey] = initializePluckedPropInfo();
  }
  returnVal[ROOT_COMPONENT_LABEL] = initializePluckedPropInfo();
  return returnVal;
}
