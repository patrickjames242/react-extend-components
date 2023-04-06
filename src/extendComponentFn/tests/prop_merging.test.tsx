import { ReactNode } from 'react';
import { create } from 'react-test-renderer';
import { defaultPropsMergeFn } from '../../defaultPropsMergeFn';
import { MergeFunctionProvider } from '../../MergeFunctionProvider';
import { PropsMergeFn, PropsMergeFnInfo } from '../../types';
import { extendComponentFn } from '../extendComponentFn';

describe('props merge function is called with the correct arguments', () => {
  test('for root component', () => {
    const propsMergeFn = jest.fn(() => ({}));
    const TestComponent = extendComponentFn(
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
      type: 'div',
      label: 'root',
    } satisfies PropsMergeFnInfo);

    create(<TestComponent style={{ backgroundColor: 'red' }} hidden />);
    expect(propsMergeFn).toHaveBeenNthCalledWith(2, {
      outerProps: { style: { backgroundColor: 'red' }, hidden: true },
      innerProps: { title: 'blah' },
      defaultMergeFn: defaultPropsMergeFn,
      type: 'div',
      label: 'root',
    } satisfies PropsMergeFnInfo);
  });

  test('for child components', () => {
    const propsMergeFn: PropsMergeFn = jest.fn(
      ({ innerProps, outerProps, defaultMergeFn }) =>
        defaultMergeFn({ innerProps, outerProps })
    );

    const TestComponent = extendComponentFn('div', { EditButton: 'button' })(
      (Div, { EditButton }) => {
        return (
          <Div className="patrick hanna">
            <EditButton tabIndex={30} style={{ backgroundColor: 'orange' }} />
          </Div>
        );
      },
      propsMergeFn as any
    );

    create(
      <TestComponent
        editButtonProps={{
          style: { color: 'red' },
        }}
        style={{ color: 'red' }}
      />
    );

    expect(propsMergeFn).toHaveBeenCalledWith({
      innerProps: { className: 'patrick hanna', children: expect.anything() },
      outerProps: { style: { color: 'red' } },
      defaultMergeFn: defaultPropsMergeFn,
      type: 'div',
      label: 'root',
    } satisfies PropsMergeFnInfo);

    expect(propsMergeFn).toHaveBeenCalledWith({
      innerProps: { tabIndex: 30, style: { backgroundColor: 'orange' } },
      outerProps: { style: { color: 'red' } },
      defaultMergeFn: defaultPropsMergeFn,
      type: 'button',
      label: 'EditButton',
    } satisfies PropsMergeFnInfo);
  });
});

describe('The result of the props merge function is passed to the underlying element', () => {
  test('extender args', () => {
    let propsMergeFnResult: object = {};

    const TestComponent = extendComponentFn('div')(
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

    const TestComponent = extendComponentFn(
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
    const TestComponent = extendComponentFn('div')((Div) => {
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
  const TestComponent = extendComponentFn(
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

test("extender args merge function overrides merge function provider's merge function", () => {
  const TestComponent = extendComponentFn(
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

test("merge functions for specific components are only used by that component and not it's children", () => {
  const Component1 = extendComponentFn('p')<{ children?: ReactNode }>(
    (P) => <P />,
    ({ outerProps }) =>
      ({
        fn: 'component1 merge function',
        children: outerProps.children,
      } as any)
  );
  const Component2 = extendComponentFn('div')(
    (Div) => (
      <Component1>
        <Div />
      </Component1>
    ),
    () => ({ fn: 'component2 merge function' } as any)
  );

  const component = create(<Component2 />);

  expect(component.root.findByType('div').props).toEqual({
    fn: 'component2 merge function',
  });
});
