import { RefObject } from 'react';
import { defaultPropsMergeFn } from './defaultPropsMergeFn';
import { setRefValue } from './testUtils/setRefValue';

describe('className prop merging', () => {
  test('appends outer className to inner className when both are included', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: 'blah1' },
      innerProps: { className: 'blah2' },
    });
    expect(resultProps.className).toBe('blah2 blah1');
  });

  describe('provides only outer className when inner className is not provided', () => {
    test('when undefined', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: { className: 'blah' },
        innerProps: { className: undefined },
      });
      expect(resultProps.className).toBe('blah');
    });

    test('when null', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: { className: 'blah' },
        innerProps: { className: null },
      });
      expect(resultProps.className).toBe('blah');
    });

    test('when not provided', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: { className: 'blah' },
        innerProps: {},
      });
      expect(resultProps.className).toBe('blah');
    });
  });

  describe('provides only inner className when outer className is not provided', () => {
    test('when undefined', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: { className: undefined },
        innerProps: { className: 'blah' },
      });
      expect(resultProps.className).toBe('blah');
    });

    test('when null', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: { className: null },
        innerProps: { className: 'blah' },
      });
      expect(resultProps.className).toBe('blah');
    });

    test('when not provided', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: {},
        innerProps: { className: 'blah' },
      });
      expect(resultProps.className).toBe('blah');
    });
  });

  test('className is undefined when neither outer nor inner className is defined', () => {
    const resultProps1 = defaultPropsMergeFn({
      outerProps: {},
      innerProps: {},
    });
    expect(resultProps1).not.toHaveProperty('className');

    const resultProps2 = defaultPropsMergeFn({
      outerProps: { className: undefined },
      innerProps: { className: undefined },
    });
    expect(resultProps2).toHaveProperty('className', undefined);
  });
});

describe('style prop merging', () => {
  test('outer styles override inner styles', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        style: {
          color: 'red',
          margin: '2px',
          backgroundColor: 'green',
          padding: undefined,
          zIndex: null,
        },
      },
      innerProps: {
        style: {
          color: 'blue',
          margin: '10px',
          fontSize: '12px',
          padding: 37,
          zIndex: 3,
        },
      },
    });
    expect(resultProps.style).toEqual({
      color: 'red',
      backgroundColor: 'green',
      fontSize: '12px',
      margin: '2px',
      padding: 37,
      zIndex: null,
    });
  });

  test('outer style is used when inner style is not provided', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        style: { color: 'red', margin: '2px', backgroundColor: 'green' },
      },
      innerProps: {},
    });
    expect(resultProps.style).toEqual({
      color: 'red',
      margin: '2px',
      backgroundColor: 'green',
    });
  });

  test('inner style is used when outer style is not provided', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {},
      innerProps: {
        style: { color: 'red', margin: '2px', backgroundColor: 'green' },
      },
    });
    expect(resultProps.style).toEqual({
      color: 'red',
      margin: '2px',
      backgroundColor: 'green',
    });
  });
});

describe('ref merging', () => {
  test('properly merges refs', () => {
    const outerRef: RefObject<string> = { current: null };
    const innerRef: RefObject<string> = { current: null };
    const resultProps = defaultPropsMergeFn({
      innerProps: { ref: innerRef },
      outerProps: { ref: outerRef },
    });
    setRefValue(resultProps.ref, 'hello');
    expect(outerRef.current).toEqual('hello');
    expect(innerRef.current).toEqual('hello');
  });

  test("outer ref is used when inner ref isn't provided", () => {
    const outerRef: RefObject<string> = { current: null };
    const resultProps = defaultPropsMergeFn({
      innerProps: {},
      outerProps: { ref: outerRef },
    });
    setRefValue(resultProps.ref, 'hello');
    expect(outerRef.current).toEqual('hello');
    expect(resultProps.ref).toBe(outerRef);
  });

  test("inner ref is used when outer ref isn't provided", () => {
    const innerRef: RefObject<string> = { current: null };
    const resultProps = defaultPropsMergeFn({
      innerProps: { ref: innerRef },
      outerProps: {},
    });
    setRefValue(resultProps.ref, 'hello');
    expect(innerRef.current).toEqual('hello');
    expect(resultProps.ref).toBe(innerRef);
  });

  test('no ref is provided when neither inner nor outer ref is provided', () => {
    expect(
      defaultPropsMergeFn({
        innerProps: {},
        outerProps: {},
      })
    ).not.toHaveProperty('ref');
    expect(
      defaultPropsMergeFn({
        innerProps: { ref: undefined },
        outerProps: { ref: undefined },
      }).ref
    ).toBeUndefined();
  });
});

describe('function prop merging', () => {
  test('outer and inner function props are merged', () => {
    const outerFn = jest.fn();
    const innerFn = jest.fn();
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        onClick: outerFn,
      },
      innerProps: {
        onClick: innerFn,
      },
    });

    resultProps.onClick('some event');

    expect(outerFn).toHaveBeenCalledTimes(1);
    expect(outerFn).toHaveBeenCalledWith('some event');
    expect(innerFn).toHaveBeenCalledTimes(1);
    expect(innerFn).toHaveBeenCalledWith('some event');
  });

  test('outer function return value is returned from merged function', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        onClick: () => 'outer-return-value',
      },
      innerProps: {
        onClick: () => 'inner-return-value',
      },
    });
    const returnValue = resultProps.onClick();
    expect(returnValue).toEqual('outer-return-value');
  });

  describe('outer function value is used when inner function value is not provided', () => {
    test('when inner function value is undefined', () => {
      const outerFn = jest.fn(() => 'outer-return-value');
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          onClick: outerFn,
        },
        innerProps: {
          onClick: undefined,
        },
      });
      const returnValue = resultProps.onClick('some event');
      expect(outerFn).toHaveBeenCalledTimes(1);
      expect(outerFn).toHaveBeenCalledWith('some event');
      expect(returnValue).toEqual('outer-return-value');
    });

    test('when inner function value is null', () => {
      const outerFn = jest.fn(() => 'outer-return-value');
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          onClick: outerFn,
        },
        innerProps: {
          onClick: null,
        },
      });
      const returnValue = resultProps.onClick('some event');
      expect(outerFn).toHaveBeenCalledTimes(1);
      expect(outerFn).toHaveBeenCalledWith('some event');
      expect(returnValue).toEqual('outer-return-value');
    });

    test('when inner function value is not included', () => {
      const outerFn = jest.fn(() => 'outer-return-value');
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          onClick: outerFn,
        },
        innerProps: {},
      });
      const returnValue = resultProps.onClick('some event');
      expect(outerFn).toHaveBeenCalledTimes(1);
      expect(outerFn).toHaveBeenCalledWith('some event');
      expect(returnValue).toEqual('outer-return-value');
    });
  });

  describe("inner function value is used when outer function value isn't provided", () => {
    test('when outer function value is undefined', () => {
      const innerFn = jest.fn(() => 'inner-return-value');
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          onClick: undefined,
        },
        innerProps: {
          onClick: innerFn,
        },
      });
      const returnValue = resultProps.onClick('some event');
      expect(innerFn).toHaveBeenCalledTimes(1);
      expect(innerFn).toHaveBeenCalledWith('some event');
      expect(returnValue).toEqual('inner-return-value');
    });

    test('when outer function value is null', () => {
      const innerFn = jest.fn(() => 'inner-return-value');
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          onClick: null,
        },
        innerProps: {
          onClick: innerFn,
        },
      });
      const returnValue = resultProps.onClick('some event');
      expect(innerFn).toHaveBeenCalledTimes(1);
      expect(innerFn).toHaveBeenCalledWith('some event');
      expect(returnValue).toEqual('inner-return-value');
    });

    test('when outer function value is not included', () => {
      const innerFn = jest.fn(() => 'inner-return-value');
      const resultProps = defaultPropsMergeFn({
        outerProps: {},
        innerProps: {
          onClick: innerFn,
        },
      });
      const returnValue = resultProps.onClick('some event');
      expect(innerFn).toHaveBeenCalledTimes(1);
      expect(innerFn).toHaveBeenCalledWith('some event');
      expect(returnValue).toEqual('inner-return-value');
    });
  });

  test("outer value overrides inner value when outer value isn't a function but inner value is", () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        onClick: 'outer-value',
      },
      innerProps: {
        onClick: () => {},
      },
    });

    expect(resultProps.onClick).toEqual('outer-value');
  });

  test("outer value overrides inner value when outer value is a function but inner value isn't", () => {
    const outerFn = jest.fn();
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        onClick: outerFn,
      },
      innerProps: {
        onClick: 'inner-value',
      },
    });
    resultProps.onClick('some event');
    expect(outerFn).toHaveBeenCalledTimes(1);
    expect(outerFn).toHaveBeenCalledWith('some event');
  });
});

describe('children prop merging', () => {
  test('inner value overrides outer value if inner value is set', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        children: 'outer-value',
      },
      innerProps: {
        children: 'inner-value',
      },
    });
    expect(resultProps.children).toEqual('inner-value');

    const resultProps2 = defaultPropsMergeFn({
      outerProps: {
        children: 'outer-value',
      },
      innerProps: {
        children: null,
      },
    });
    expect(resultProps2.children).toEqual(null);
  });

  describe("outer value is used when inner value isn't set", () => {
    test('when inner value is undefined', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          children: 'outer-value',
        },
        innerProps: {
          children: undefined,
        },
      });
      expect(resultProps.children).toEqual('outer-value');
    });

    test('when inner value is not included', () => {
      const resultProps = defaultPropsMergeFn({
        outerProps: {
          children: 'outer-value',
        },
        innerProps: {},
      });
      expect(resultProps.children).toEqual('outer-value');
    });
  });
});

describe('general prop merging', () => {
  test('outer props override inner props where needed', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {
        prop1: 'outer-prop-value',
        prop2: undefined,
        prop3: null,
        prop4: 123,
      },
      innerProps: {
        prop1: 'inner-prop-value',
        prop2: 'inner-prop-value',
        prop3: 'inner-prop-value',
        prop5: false,
      },
    });
    expect(resultProps).toEqual({
      prop1: 'outer-prop-value',
      prop2: 'inner-prop-value',
      prop3: null,
      prop4: 123,
      prop5: false,
    });
  });
});
