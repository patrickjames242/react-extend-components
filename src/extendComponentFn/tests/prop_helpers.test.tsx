import { create } from 'react-test-renderer';
import { extendComponentFn } from '../extendComponentFn';

describe('plucked props are not passed to the underlying root element', () => {
  test('for root element', () => {
    let propsToPluck: string[];
    const TestComponent = extendComponentFn('section')(
      (Section, _, helpers) => {
        helpers.pluck(...(propsToPluck as any));
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

    expect(getProps()).toEqual({
      style: { color: 'red' },
      className: 'patrick',
    });
  });

  test('for child element', () => {
    let propsToPluck: string[];
    const TestComponent = extendComponentFn('section', { SomeChild: 'div' })(
      (Section, { SomeChild }, _, helpers) => {
        helpers.forChild('SomeChild').pluck(...(propsToPluck as any));
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

describe('plucked props are returned from the pluck function', () => {
  test('for root element', () => {
    let propsToPluck: string[] = [];
    const receivePluckedProps = jest.fn();

    const TestComponent = extendComponentFn('input')((Input, _, helpers) => {
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

  test('for child element', () => {
    let propsToPluck: string[] = [];
    const receivePluckedProps = jest.fn();

    const TestComponent = extendComponentFn('p', { myChild: 'span' })(
      (P, { MyChild }, _, helpers) => {
        receivePluckedProps(
          helpers.forChild('myChild').pluck(...(propsToPluck as any))
        );
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

test('when using pluckAll, no props are passed to the underlying root element', () => {
  const TestComponent = extendComponentFn('p')((P, _, helpers) => {
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

  const TestComponent = extendComponentFn('input')((Input, _, helpers) => {
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
  const TestComponent = extendComponentFn('div')((Div, _, helpers) => {
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
