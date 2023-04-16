import { getChildComponentPropsNameProp } from '../../utils/getChildComponentPropsNameProp';

test('gets correct child component prop name value', () => {
  expect(getChildComponentPropsNameProp('button')).toBe('buttonProps');
  expect(getChildComponentPropsNameProp('Button')).toBe('buttonProps');
});
