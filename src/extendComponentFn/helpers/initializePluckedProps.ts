import {
  ChildComponentsConstraint,
  FilterChildComponents,
  ROOT_COMPONENT_LABEL,
} from '../../types';

export interface PluckedPropInfo {
  isPropPlucked: (prop: string | number | symbol) => boolean;
  areAllPropsPlucked: () => boolean;
  getAllPluckedProps: () => (string | number | symbol)[];
  pluckProp: (prop: string | number | symbol) => void;
  pluckAllProps: () => void;
}

export function initializePluckedProps<
  ChildComponents extends ChildComponentsConstraint
>(
  childComponents: ChildComponents | undefined
): (
  label: ROOT_COMPONENT_LABEL | keyof FilterChildComponents<ChildComponents>
) => PluckedPropInfo {
  const obj: any = {};
  for (const childKey in childComponents ?? {}) {
    obj[childKey] = __initializeIndividualPluckedPropInfo();
  }
  obj[ROOT_COMPONENT_LABEL] = __initializeIndividualPluckedPropInfo();

  return (label) => {
    if (!obj[label]) {
      throw new Error(`No plucked prop info for label: ${String(label)}`);
    }
    return obj[label];
  };
}

function __initializeIndividualPluckedPropInfo(): PluckedPropInfo {
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
