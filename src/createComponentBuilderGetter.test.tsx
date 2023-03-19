import { create } from 'react-test-renderer';
import { createComponentBuilderGetter } from './createComponentBuilderGetter';
import { createWithAct } from './testUtils/createWithAct';

test('passes props to underlying element', () => {
  const TestComponent = createComponentBuilderGetter('div')((Div) => {
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

test('plucked props are not passed to the underlying element', () => {
  const TestComponent = createComponentBuilderGetter('section')(
    (Section, props) => {
      props.pluck('style', 'className');
      return <Section />;
    }
  );

  const propsPassedToElement = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  ).root.findByType('section').props;

  expect(propsPassedToElement).toEqual({ id: 'blah' });
});

test('plucked props are returned from the pluck function', () => {
  let propsToPluck: string[] = [];
  const receivePluckedProps = jest.fn();

  const TestComponent = createComponentBuilderGetter('input')(
    (Input, props) => {
      receivePluckedProps(props.pluck(...(propsToPluck as any)));
      return <Input />;
    }
  );

  propsToPluck = ['style', 'className'];

  const created = createWithAct(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );

  expect(receivePluckedProps).toHaveBeenNthCalledWith(1, {
    style: { color: 'red' },
    className: 'patrick',
  });

  propsToPluck = ['id', 'style'];

  created.update(
    <TestComponent
      style={{ backgroundColor: 'green' }}
      className="patrick123"
      id="7"
    />
  );

  expect(receivePluckedProps).toHaveBeenNthCalledWith(2, {
    style: { backgroundColor: 'green' },
    id: '7',
  });
});

test('when using pluckAll, no props are passed to the underlying element', () => {
  const TestComponent = createComponentBuilderGetter('p')((P, props) => {
    props.pluckAll();
    return <P />;
  });

  const created = createWithAct(
    <TestComponent
      style={{ color: 'red' }}
      className="some-class-name"
      id="blah"
    />
  );

  const getProps = (): any => created.root.findByType('p').props;
  expect(getProps()).toEqual({});
});
