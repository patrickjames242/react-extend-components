import { create } from 'react-test-renderer';
import { extendComponentFn } from '../extendComponentFn';

test('passes props to underlying root element', () => {
  const TestComponent = extendComponentFn('div')((Div) => {
    return <Div />;
  });

  const component = create(<TestComponent title="blah" tabIndex={-1} />);
  const getPropsPassedToElement = (): any =>
    component.root.findByType('div').props;

  expect(getPropsPassedToElement()).toEqual({ title: 'blah', tabIndex: -1 });

  component.update(<TestComponent style={{ color: 'red' }} hidden />);
  expect(getPropsPassedToElement()).toEqual({
    style: { color: 'red' },
    hidden: true,
  });
});

test('passes props to underlying child element', () => {
  const TestComponent = extendComponentFn('div', { button: 'button' })(
    (Div, { Button }) => {
      return (
        <Div>
          <Button />
        </Div>
      );
    }
  );

  const component = create(
    <TestComponent buttonProps={{ title: 'blah', tabIndex: -1 }} />
  );

  const getPropsPassedToButton = (): any =>
    component.root.findByType('button').props;

  expect(getPropsPassedToButton()).toEqual({ title: 'blah', tabIndex: -1 });

  component.update(
    <TestComponent
      buttonProps={{
        style: { color: 'red' },
        hidden: true,
      }}
    />
  );
  expect(getPropsPassedToButton()).toEqual({
    style: { color: 'red' },
    hidden: true,
  });
});

test('passes props to underlying root and child elements', () => {
  const TestComponent = extendComponentFn('div', { button: 'button' })(
    (Div, { Button }) => {
      return (
        <Div>
          <Button className="Patrick" />
        </Div>
      );
    }
  );

  const component = create(
    <TestComponent
      style={{ color: 'red' }}
      buttonProps={{ title: 'blah', tabIndex: -1 }}
    />
  );

  const getPropsPassedToButton = (): any =>
    component.root.findByType('button').props;
  const getPropsPassedToDiv = (): any => component.root.findByType('div').props;

  expect(getPropsPassedToButton()).toEqual({
    title: 'blah',
    tabIndex: -1,
    className: 'Patrick',
  });

  expect(getPropsPassedToDiv()).toEqual({
    style: { color: 'red' },
    children: expect.anything(),
  });

  component.update(
    <TestComponent
      className="blahblah"
      buttonProps={{
        style: { color: 'red' },
        hidden: true,
      }}
    />
  );
  expect(getPropsPassedToButton()).toEqual({
    style: { color: 'red' },
    hidden: true,
    className: 'Patrick',
  });
  expect(getPropsPassedToDiv()).toEqual({
    className: 'blahblah',
    children: expect.anything(),
  });
});
