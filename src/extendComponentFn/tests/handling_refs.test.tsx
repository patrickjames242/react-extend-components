import { render } from '@testing-library/react';
import { Ref } from 'react';
import { extendComponentFn } from '../extendComponentFn';

test('TypeScript allows plucking refs inherited from the base component', () => {
  extendComponentFn('div')((Div) => {
    Div.props.pluck('ref').ref satisfies Ref<HTMLDivElement> | undefined;
    return <Div />;
  });
});

test('TypeScript allows plucking custom defined refs', () => {
  type MyCustomRefType = {
    someMethod: () => void;
  };
  extendComponentFn('div')<{}, MyCustomRefType>((Div) => {
    Div.props.pluck('ref').ref satisfies Ref<MyCustomRefType> | undefined;
    return <Div />;
  });
});

test('Typescript allows peeking at inherited refs', () => {
  extendComponentFn('div')((Div) => {
    Div.props.peek('ref') satisfies Ref<HTMLDivElement> | undefined;
    Div.props.peek().ref satisfies Ref<HTMLDivElement> | undefined;
    return <Div />;
  });
});

test('TypeScript allows peeking at custom defined refs', () => {
  type MyCustomRefType = {
    someMethod: () => void;
  };
  extendComponentFn('div')<{}, MyCustomRefType>((Div) => {
    Div.props.peek('ref') satisfies Ref<MyCustomRefType> | undefined;
    Div.props.peek().ref satisfies Ref<MyCustomRefType> | undefined;
    return <Div />;
  });
});

describe('passes ref to underlying component', () => {
  test('for root component', () => {
    const myRef = jest.fn();
    const MyComponent = extendComponentFn('div')((Div) => {
      return <Div></Div>;
    });
    render(<MyComponent ref={myRef} />);
    expect(myRef).toHaveBeenNthCalledWith(1, expect.any(HTMLDivElement));
  });

  test('for child component', () => {
    const myRef = jest.fn();
    const MyComponent = extendComponentFn('div', { child: 'p' })(
      (Div, { Child }) => {
        return (
          <Div>
            <Child />
          </Div>
        );
      }
    );
    render(<MyComponent childProps={{ ref: myRef }} />);
    expect(myRef).toHaveBeenNthCalledWith(1, expect.any(HTMLParagraphElement));
  });
});

describe("destructured ref isn't passed to underlying component", () => {
  test('for root component', () => {
    const myRef = jest.fn();
    // eslint-disable-next-line unused-imports/no-unused-vars
    const MyComponent = extendComponentFn('div')((Div, { ref }) => {
      return <Div></Div>;
    });
    render(<MyComponent ref={myRef} />);
    expect(myRef).toHaveBeenCalledTimes(0);
  });

  test('for child component', () => {
    const myRef = jest.fn();
    // eslint-disable-next-line unused-imports/no-unused-vars
    const MyComponent = extendComponentFn('div', { child: 'section' })(
      (Div, { Child }) => {
        // eslint-disable-next-line unused-imports/no-unused-vars
        const { ref } = Child.props.detectPlucked();

        return (
          <Div>
            <Child />
          </Div>
        );
      }
    );
    render(<MyComponent childProps={{ ref: myRef }} />);
    expect(myRef).toHaveBeenCalledTimes(0);
  });
});
