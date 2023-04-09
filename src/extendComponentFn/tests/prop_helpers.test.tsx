import { create } from 'react-test-renderer';
import { extendComponentFn } from '../extendComponentFn';

test("TypeScript allows plucking custom props and the base component's own props", () => {
  extendComponentFn('div')<{ myProp: string }>((Div) => {
    Div.props.pluck('myProp').myProp satisfies string;
    Div.props.pluck('className').className satisfies string | undefined;
    return <Div />;
  });
});

test("TypeScript allows peeking at custom props and the base component's own props", () => {
  extendComponentFn('div')<{ myProp: string }>((Div) => {
    Div.props.peek('myProp') satisfies string;
    Div.props.peek('className') satisfies string | undefined;
    Div.props.peek().myProp satisfies string;
    Div.props.peek().className satisfies string | undefined;
    return <Div />;
  });
});

test('TypeScript produces correct type for pluckOne', () => {
  extendComponentFn('div')<{ myProp: string }>((Div) => {
    Div.props.pluckOne('myProp') satisfies string;
    Div.props.pluckOne('className') satisfies string | undefined;
    return <Div />;
  });
});

test('TypeScript produces correct type for pluckAll', () => {
  extendComponentFn('div')<{ myProp: string }>((Div) => {
    Div.props.pluckAll().myProp satisfies string;
    Div.props.pluckAll().className satisfies string | undefined;
    return <Div />;
  });
});

test('TypeScript produces correct type for detectPlucked', () => {
  extendComponentFn('div')<{ myProp: string }>((Div) => {
    Div.props.detectPlucked().myProp satisfies string;
    Div.props.detectPlucked().className satisfies string | undefined;
    return <Div />;
  });
});

describe('plucked props are not passed to the underlying root element', () => {
  test('for root element', () => {
    let propsToPluck: string[];

    const TestComponent = extendComponentFn('section')((Section) => {
      Section.props.pluck(...(propsToPluck as any));
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

    expect(getProps()).toEqual({
      style: { color: 'red' },
      className: 'patrick',
    });
  });

  test('for child element', () => {
    let propsToPluck: string[];
    const TestComponent = extendComponentFn('section', { SomeChild: 'div' })(
      (Section, { SomeChild }) => {
        SomeChild.props.pluck(...(propsToPluck as any));
        return (
          <Section>
            <SomeChild />
          </Section>
        );
      }
    );

    propsToPluck = ['style', 'className'];
    const component = create(
      <TestComponent
        someChildProps={{
          style: { color: 'red' },
          className: 'patrick',
          id: 'blah',
        }}
      />
    );
    const getProps = (): any => component.root.findByType('div').props;
    expect(getProps()).toEqual({ id: 'blah' });

    propsToPluck = ['tabIndex', 'hidden'];
    component.update(
      <TestComponent
        someChildProps={{
          style: { color: 'red' },
          className: 'patrick',
          tabIndex: -1,
          hidden: true,
        }}
      />
    );

    expect(getProps()).toEqual({
      style: { color: 'red' },
      className: 'patrick',
    });
  });
});

describe('when using pluck, plucked props are returned from the pluck function', () => {
  test('for root element', () => {
    let propsToPluck: string[] = [];
    const receivePluckedProps = jest.fn();

    const TestComponent = extendComponentFn('input')((Input) => {
      receivePluckedProps(Input.props.pluck(...(propsToPluck as any)));
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

  test('for child element', () => {
    let propsToPluck: string[] = [];
    const receivePluckedProps = jest.fn();

    const TestComponent = extendComponentFn('p', { myChild: 'span' })(
      (P, { MyChild }) => {
        receivePluckedProps(MyChild.props.pluck(...(propsToPluck as any)));
        return (
          <P>
            <MyChild />
          </P>
        );
      }
    );

    propsToPluck = ['style', 'className'];

    const component = create(
      <TestComponent
        myChildProps={{
          style: { color: 'red' },
          className: 'patrick',
          id: 'blah',
        }}
      />
    );

    expect(receivePluckedProps).toHaveBeenNthCalledWith(1, {
      style: { color: 'red' },
      className: 'patrick',
    });

    propsToPluck = ['id', 'style'];

    component.update(
      <TestComponent
        myChildProps={{
          style: { backgroundColor: 'green' },
          className: 'patrick123',
          id: '7',
        }}
      />
    );

    expect(receivePluckedProps).toHaveBeenNthCalledWith(2, {
      style: { backgroundColor: 'green' },
      id: '7',
    });
  });
});

describe('when using pluckOne, the plucked prop is returned from the pluckOne function', () => {
  test('for root element', () => {
    let propToPluck: string | undefined = undefined;
    const receivePluckedProps = jest.fn();

    const TestComponent = extendComponentFn('input')((Input) => {
      receivePluckedProps(Input.props.pluckOne(propToPluck as any));
      return <Input />;
    });

    propToPluck = 'style';

    const component = create(
      <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
    );

    expect(receivePluckedProps).toHaveBeenNthCalledWith(1, { color: 'red' });

    propToPluck = 'id';

    component.update(
      <TestComponent
        style={{ backgroundColor: 'green' }}
        className="patrick123"
        id="7"
      />
    );

    expect(receivePluckedProps).toHaveBeenNthCalledWith(2, '7');
  });

  test('for child elements', () => {
    let propToPluck: string | undefined = undefined;
    const receivePluckedProps = jest.fn();

    const TestComponent = extendComponentFn('div', { child: 'article' })(
      (Div, { Child }) => {
        receivePluckedProps(Child.props.pluckOne(propToPluck as any));
        return <Div />;
      }
    );

    propToPluck = 'style';

    const component = create(
      <TestComponent
        childProps={{
          style: { color: 'red' },
          className: 'patrick',
          id: 'blah',
        }}
      />
    );

    expect(receivePluckedProps).toHaveBeenNthCalledWith(1, { color: 'red' });

    propToPluck = 'id';

    component.update(
      <TestComponent
        childProps={{
          style: { backgroundColor: 'green' },
          className: 'patrick123',
          id: '7',
        }}
      />
    );

    expect(receivePluckedProps).toHaveBeenNthCalledWith(2, '7');
  });
});

test('when using pluckAll, no props are passed to the underlying root element', () => {
  const TestComponent = extendComponentFn('p')((P) => {
    P.props.pluckAll();
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

test('peek() returns all props, including those that are plucked', () => {
  let propsToPluck: string[] = [];
  const receivePeekedProps = jest.fn();

  const TestComponent = extendComponentFn('input')((Input) => {
    Input.props.pluck(...(propsToPluck as any));
    receivePeekedProps(Input.props.peek());
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

describe("peek('prop') returns the given prop, even if it is plucked", () => {
  test('for root component', () => {
    let propsToPluck: string[] = [];
    const receivePeekedProp = jest.fn();

    const TestComponent = extendComponentFn('input')((Input) => {
      Input.props.pluck(...(propsToPluck as any));
      receivePeekedProp(Input.props.peek('className'));
      return <Input />;
    });

    propsToPluck = ['style', 'className'];

    const component = create(
      <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
    );

    expect(receivePeekedProp).toHaveBeenNthCalledWith(1, 'patrick');

    propsToPluck = ['id', 'style'];

    component.update(
      <TestComponent
        style={{ backgroundColor: 'green' }}
        className="patrick123"
        id="7"
      />
    );

    expect(receivePeekedProp).toHaveBeenNthCalledWith(2, 'patrick123');
  });

  test('for child component', () => {
    let propsToPluck: string[] = [];
    const receivePeekedProp = jest.fn();

    const TestComponent = extendComponentFn('div', { Child: 'div' })(
      (Div, { Child }) => {
        Child.props.pluck(...(propsToPluck as any));
        receivePeekedProp(Child.props.peek('className'));
        return (
          <Div>
            <Child />
          </Div>
        );
      }
    );

    propsToPluck = ['style', 'className'];

    const component = create(
      <TestComponent
        childProps={{
          style: { color: 'red' },
          className: 'patrick',
          id: 'blah',
        }}
      />
    );

    expect(receivePeekedProp).toHaveBeenNthCalledWith(1, 'patrick');

    propsToPluck = ['id', 'style'];

    component.update(
      <TestComponent
        childProps={{
          style: { backgroundColor: 'green' },
          className: 'patrick123',
          id: '7',
        }}
      />
    );

    expect(receivePeekedProp).toHaveBeenNthCalledWith(2, 'patrick123');
  });
});

describe('peeked props are always passed to the underlying element', () => {
  test('when peeking all props', () => {
    const TestComponent = extendComponentFn('div')((Div) => {
      Div.props.peek();
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

  describe('when peeking one prop', () => {
    test('for root component', () => {
      const TestComponent = extendComponentFn('div')((Div) => {
        Div.props.peek('className');
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

    test('for child component', () => {
      const TestComponent = extendComponentFn('div', { someButton: 'button' })(
        (Div, { SomeButton }) => {
          Div.props.peek('className');
          return (
            <Div>
              <SomeButton />
            </Div>
          );
        }
      );

      const component = create(
        <TestComponent
          someButtonProps={{
            style: { color: 'red' },
            className: 'patrick',
            id: 'blah',
          }}
        />
      );

      const getProps = (): any => component.root.findByType('button').props;

      expect(getProps()).toEqual({
        style: { color: 'red' },
        className: 'patrick',
        id: 'blah',
      });

      component.update(
        <TestComponent
          someButtonProps={{
            style: { backgroundColor: 'green' },
            className: 'patrick123',
            id: '7',
          }}
        />
      );

      expect(getProps()).toEqual({
        style: { backgroundColor: 'green' },
        className: 'patrick123',
        id: '7',
      });
    });
  });
});
