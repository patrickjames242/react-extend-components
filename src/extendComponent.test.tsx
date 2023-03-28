import { create } from 'react-test-renderer';
import { defaultPropsMergeFn } from './defaultPropsMergeFn';
import { extendComponent } from './extendComponent';
import { MergeFunctionProvider } from './MergeFunctionProvider';
import { PropsMergeFnInfo } from './types';

test('passes props to underlying element', () => {
  const TestComponent = extendComponent('div')((Div) => {
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

test('destructured props are not passed to the underlying element', () => {
  const TestComponent = extendComponent('section')(
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

test('plucked props are not passed to the underlying element', () => {
  let propsToPluck: string[];
  const TestComponent = extendComponent('section')((Section, _, helpers) => {
    helpers.pluck(...(propsToPluck as any));
    return <Section />;
  });

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

  const TestComponent = extendComponent('input')((Input, _, helpers) => {
    receivePluckedProps(helpers.pluck(...(propsToPluck as any)));
    return <Input />;
  });

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
  const TestComponent = extendComponent('p')((P, _, helpers) => {
    helpers.pluckAll();
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

test('Peek returns all props, including those that are plucked', () => {
  let propsToPluck: string[] = [];
  const receivePeekedProps = jest.fn();

  const TestComponent = extendComponent('input')((Input, _, helpers) => {
    helpers.pluck(...(propsToPluck as any));
    receivePeekedProps(helpers.peek());
    return <Input />;
  });

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
  const TestComponent = extendComponent('div')((Div, _, helpers) => {
    helpers.peek();
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

describe('The result of the props merge function is passed to the underlying element', () => {
  test('extender args', () => {
    let propsMergeFnResult: object = {};

    const TestComponent = extendComponent('div')(
      (Div) => {
        return <Div />;
      },
      () => propsMergeFnResult
    );

    propsMergeFnResult = { tabIndex: -1 };
    const component = create(<TestComponent style={{ color: 'red' }} />);
    const getProps = (): any => component.root.findByType('div').props;
    expect(getProps()).toEqual({ tabIndex: -1 });

    propsMergeFnResult = { patrick: 'hanna' };
    component.update(<TestComponent style={{ color: 'red' }} hidden />);
    expect(getProps()).toEqual({ patrick: 'hanna' });
  });

  test('extender getter args', () => {
    let propsMergeFnResult: object = {};

    const TestComponent = extendComponent(
      'div',
      () => propsMergeFnResult
    )((Div) => {
      return <Div />;
    });

    propsMergeFnResult = { tabIndex: -1 };
    const component = create(<TestComponent style={{ color: 'red' }} />);
    const getProps = (): any => component.root.findByType('div').props;
    expect(getProps()).toEqual({ tabIndex: -1 });

    propsMergeFnResult = { patrick123: 'hanna' };
    component.update(<TestComponent style={{ color: 'red' }} hidden />);
    expect(getProps()).toEqual({ patrick123: 'hanna' });
  });

  test('merge function provider', () => {
    const TestComponent = extendComponent('div')((Div) => {
      return <Div />;
    });

    const component = create(
      <MergeFunctionProvider propsMergeFn={() => ({ tabIndex: -1 })}>
        <TestComponent style={{ color: 'red' }} />
      </MergeFunctionProvider>
    );
    const getProps = (): any => component.root.findByType('div').props;
    expect(getProps()).toEqual({ tabIndex: -1 });

    component.update(
      <MergeFunctionProvider propsMergeFn={() => ({ patrick123: 'hanna' })}>
        <TestComponent style={{ color: 'red' }} hidden />
      </MergeFunctionProvider>
    );
    expect(getProps()).toEqual({ patrick123: 'hanna' });
  });
});

test("extender merge fn overrides extender getter's merge fn", () => {
  const TestComponent = extendComponent(
    'div',
    () => ({ mergeFn1: 'blah123' } as any)
  )(
    (Div) => {
      return <Div />;
    },
    () => ({ mergeFn2: 'blah123' } as any)
  );

  const component = create(<TestComponent style={{ color: 'red' }} />);
  const getProps = (): any => component.root.findByType('div').props;
  expect(getProps()).toEqual({ mergeFn2: 'blah123' });
});

test('props merge function is called with the correct arguments', () => {
  const propsMergeFn = jest.fn(() => ({}));
  const TestComponent = extendComponent(
    'div',
    propsMergeFn
  )((Div) => {
    return <Div title="blah" />;
  });

  create(<TestComponent style={{ color: 'red' }} />);
  expect(propsMergeFn).toHaveBeenNthCalledWith(1, {
    outerProps: { style: { color: 'red' } },
    innerProps: { title: 'blah' },
    defaultMergeFn: defaultPropsMergeFn,
  } satisfies PropsMergeFnInfo);

  create(<TestComponent style={{ backgroundColor: 'red' }} hidden />);
  expect(propsMergeFn).toHaveBeenNthCalledWith(2, {
    outerProps: { style: { backgroundColor: 'red' }, hidden: true },
    innerProps: { title: 'blah' },
    defaultMergeFn: defaultPropsMergeFn,
  } satisfies PropsMergeFnInfo);
});

test("extender args merge function overrides merge function provider's merge function", () => {
  const TestComponent = extendComponent(
    'div',
    () => ({ extenderGetterArgs: '123' } as any)
  )(
    (Div) => {
      return <Div />;
    },
    () => ({ extenderArgs: '123' } as any)
  );

  const component = create(
    <MergeFunctionProvider
      propsMergeFn={() => ({ mergeFunctionProviderFn: '123' })}
    >
      <TestComponent style={{ color: 'red' }} />
    </MergeFunctionProvider>
  );
  const getProps = (): any => component.root.findByType('div').props;
  expect(getProps()).toEqual({ extenderArgs: '123' });

  component.update(
    <MergeFunctionProvider
      propsMergeFn={() => ({ mergeFunctionProviderFn2: '1234' })}
    >
      <TestComponent style={{ color: 'red' }} hidden />
    </MergeFunctionProvider>
  );
  expect(getProps()).toEqual({ extenderArgs: '123' });
});
