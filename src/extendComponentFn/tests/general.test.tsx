import { ReactNode } from 'react';
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

test('extended component only passes information to the specific child components it is responsible for and not all of its children', () => {
  const Component1 = extendComponentFn('p')<{ children?: ReactNode }>(
    (P, { children }) => <P>{children}</P>
  );
  const Component2 = extendComponentFn('div')((Div) => (
    <Component1 className="patrick">
      <Div tabIndex={-1} />
    </Component1>
  ));

  const component = create(<Component2 className="hanna" />);

  expect(component.root.findByType('div').props).toEqual({
    className: 'hanna',
    tabIndex: -1,
  });
});
