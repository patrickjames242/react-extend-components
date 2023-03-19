import { create } from 'react-test-renderer';
import { createComponentBuilderGetter } from './createComponentBuilderGetter';

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
  let propsToPluck: string[];
  const TestComponent = createComponentBuilderGetter('section')(
    (Section, props) => {
      props.pluck(...(propsToPluck as any));
      return <Section />;
    }
  );

  propsToPluck = ['style', 'className'];
  const component = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );
  const getProps = (): any => component.root.findByType('section').props;
  expect(getProps()).toEqual({ id: 'blah' });

  propsToPluck = ['tabIndex', 'hidden'];
  component.update(
    <TestComponent
      style={{ color: 'red' }}
      className="patrick"
      tabIndex={-1}
      hidden
    />
  );

  expect(getProps()).toEqual({ style: { color: 'red' }, className: 'patrick' });
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

  const component = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );

  expect(receivePluckedProps).toHaveBeenNthCalledWith(1, {
    style: { color: 'red' },
    className: 'patrick',
  });

  propsToPluck = ['id', 'style'];

  component.update(
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

  const component = create(
    <TestComponent
      style={{ color: 'red' }}
      className="some-class-name"
      id="blah"
    />
  );

  const getProps = (): any => component.root.findByType('p').props;

  component.update(
    <TestComponent
      tabIndex={35}
      className="some-class-name"
      id="blah"
      onClick={() => {}}
    />
  );

  expect(getProps()).toEqual({});
});

test('refs are passed to the underlying element by default', () => {
  // const TestComponent = createComponentBuilderGetter('div')((Div) => {
  //   return <Div />;
  // });
  // const ref1 = jest.fn();
  // const component = create(<TestComponent ref={ref1} />);
  // const getProps = (): any => component.root.findByType('div').props;
  // expect(getProps()).toEqual({ ref: expect.any(Function) });
});

test('pluck function returns refs and hides them from the underlying element', () => {
  // const receivePluckedProps = jest.fn();
  // const TestComponent = createComponentBuilderGetter('div')((Div, props) => {
  //   receivePluckedProps(props.pluck('ref'));
  //   return <Div />;
  // });
  // const component = create(<TestComponent />);
  // const getProps = (): any => component.root.findByType('div').props;
  // expect(getProps()).toEqual({ ref: expect.any(Function) });
});

test('Peek returns all props, including those that are plucked', () => {
  let propsToPluck: string[] = [];
  const receivePeekedProps = jest.fn();

  const TestComponent = createComponentBuilderGetter('input')(
    (Input, props) => {
      props.pluck(...(propsToPluck as any));
      receivePeekedProps(props.peek());
      return <Input />;
    }
  );

  propsToPluck = ['style', 'className'];

  const component = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );

  expect(receivePeekedProps).toHaveBeenNthCalledWith(1, {
    style: { color: 'red' },
    className: 'patrick',
    id: 'blah',
  });

  propsToPluck = ['id', 'style'];

  component.update(
    <TestComponent
      style={{ backgroundColor: 'green' }}
      className="patrick123"
      id="7"
    />
  );

  expect(receivePeekedProps).toHaveBeenNthCalledWith(2, {
    style: { backgroundColor: 'green' },
    className: 'patrick123',
    id: '7',
  });
});

test('peeked props are always passed to the underlying element', () => {
  const TestComponent = createComponentBuilderGetter('div')((Div, props) => {
    props.peek();
    return <Div />;
  });

  const component = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );

  const getProps = (): any => component.root.findByType('div').props;

  expect(getProps()).toEqual({
    style: { color: 'red' },
    className: 'patrick',
    id: 'blah',
  });

  component.update(
    <TestComponent
      style={{ backgroundColor: 'green' }}
      className="patrick123"
      id="7"
    />
  );

  expect(getProps()).toEqual({
    style: { backgroundColor: 'green' },
    className: 'patrick123',
    id: '7',
  });
});
