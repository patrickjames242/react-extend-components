import { RefObject } from 'react';
import { defaultPropsMergeFn } from './defaultPropsMergeFn';
import { setRefValue } from './utils/setRefValue';

describe('className prop merging', () => {
  test('appends outer className to inner className when both are included', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: 'blah1' },
      innerProps: { className: 'blah2' },
    });
    expect(resultProps.className).toBe('blah2 blah1');
  });

  test('provides only outer className when inner className is undefined', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: 'blah' },
      innerProps: { className: undefined },
    });
    expect(resultProps.className).toBe('blah');
  });

  test('provides only outer className when inner className is null', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: 'blah' },
      innerProps: { className: null },
    });
    expect(resultProps.className).toBe('blah');
  });

  test("provides only outer className when inner className isn't provided", () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: 'blah' },
      innerProps: {},
    });
    expect(resultProps.className).toBe('blah');
  });

  test('provides only inner className when outer className is undefined', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: undefined },
      innerProps: { className: 'blah' },
    });
    expect(resultProps.className).toBe('blah');
  });

  test('provides only inner className when outer className is null', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: null },
      innerProps: { className: 'blah' },
    });
    expect(resultProps.className).toBe('blah');
  });

  test("provides only inner className when outer className isn't provided", () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: {},
      innerProps: { className: 'blah' },
    });
    expect(resultProps.className).toBe('blah');
  });

  test('provides only inner className when outer className is undefined', () => {
    const resultProps = defaultPropsMergeFn({
      outerProps: { className: undefined },
      innerProps: { className: 'blah' },
    });
    expect(resultProps.className).toBe('blah');
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
    const outerStyles = {
      color: 'red',
      margin: '2px',
      backgroundColor: 'green',
    };
    const innerStyles = { color: 'blue', margin: '10px', fontSize: '12px' };
    const resultProps = defaultPropsMergeFn({
      outerProps: { style: outerStyles },
      innerProps: { style: innerStyles },
    });
    expect(resultProps.style).toEqual({
      color: 'red',
      backgroundColor: 'green',
      fontSize: '12px',
      margin: '2px',
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
