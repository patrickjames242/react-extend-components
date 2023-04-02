import { create } from 'react-test-renderer';
import { extendComponentFn } from '../extendComponentFn';

test('destructured props are not passed to the underlying element', () => {
  const TestComponent = extendComponentFn('section')(
    // eslint-disable-next-line unused-imports/no-unused-vars
    (Section, { style, className }) => {
      return <Section />;
    }
  );

  const component = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );
  const getProps = (): any => component.root.findByType('section').props;
  expect(getProps()).toEqual({ id: 'blah' });

  component.update(
    <TestComponent
      style={{ color: 'red' }}
      className="patrick"
      tabIndex={-1}
      hidden
    />
  );

  expect(getProps()).toEqual({ tabIndex: -1, hidden: true });
});
