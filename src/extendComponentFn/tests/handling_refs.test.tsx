import { render } from '@testing-library/react';
import { extendComponentFn } from '../extendComponentFn';

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
