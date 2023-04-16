import { uncapitalizeFirstLetter } from './uncapitalizeFirstLetter';

export function getChildComponentPropsNameProp<ComponentLabel extends string>(
  componentLabel: ComponentLabel
): `${Uncapitalize<ComponentLabel>}Props` {
  return `${uncapitalizeFirstLetter(componentLabel)}Props`;
}
