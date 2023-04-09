import { createElement, FC } from 'react';
import { create } from 'react-test-renderer';
import { createCustomComponentExtender } from './createCustomComponentExtender';
import { extendComponentFn } from './extendComponentFn/extendComponentFn';
import { MergeFunctionProvider } from './MergeFunctionProvider';
import {
  ComponentExtenderFn,
  ExtendedComponentProps,
  ExtendedComponentWithChildComponents,
} from './types';

test('merge function in MergeFunctionProvider does not override merge function provided to custom component extender', () => {
  const customExtend = createCustomComponentExtender({
    propsMergeFn: () => ({ blah: 'customExtend' }),
  });

  const MyComponent = customExtend('div')((Div) => <Div />);

  const component = create(
    <MergeFunctionProvider
      propsMergeFn={() => ({
        blahblah: 'MergeFunctionProvider',
      })}
    >
      <MyComponent />
    </MergeFunctionProvider>
  );

  expect(component.root.findByType('div').props).toEqual({
    blah: 'customExtend',
  });
});

test('merge function in MergeFunctionProvider is used when no merge function is provided to custom component extender', () => {
  const customExtend = createCustomComponentExtender();
  const MyComponent = customExtend('div')((Div) => <Div />);

  const component = create(
    <MergeFunctionProvider
      propsMergeFn={() => ({
        blahblah: 'MergeFunctionProvider',
      })}
    >
      <MyComponent />
    </MergeFunctionProvider>
  );

  expect(component.root.findByType('div').props).toEqual({
    blahblah: 'MergeFunctionProvider',
  });
});

describe('works the same as the underlying extendComponentFn', () => {
  test('when using only a root component', () => {
    const customExtend = createCustomComponentExtender();

    function createComponentWithExtender(
      extender: ComponentExtenderFn
    ): FC<ExtendedComponentProps<'div'>> {
      return extender('div')((Div) => (
        <Div className="Patrick" style={{ color: 'purple' }} />
      ));
    }

    const props = { style: { backgroundColor: 'black' }, tabIndex: 3 };

    const component1 = create(
      createElement(createComponentWithExtender(customExtend), props)
    );
    const component2 = create(
      createElement(createComponentWithExtender(extendComponentFn), props)
    );

    expect(component1.toJSON()).toEqual(component2.toJSON());
  });

  test('when using child components', () => {
    const customExtend = createCustomComponentExtender();
    const buttonOnClick = (): void => {};

    function createComponentWithExtender(
      extender: ComponentExtenderFn
    ): ExtendedComponentWithChildComponents<'div', { MyButton: 'button' }> {
      return extender('div', { MyButton: 'button' })((Div, { MyButton }) => (
        <Div className="Patrick" style={{ color: 'purple' }}>
          <MyButton
            className="some-class-name"
            style={{ color: 'red' }}
            onClick={buttonOnClick}
          >
            Click me
          </MyButton>
        </Div>
      ));
    }

    const props = {
      style: { backgroundColor: 'black' },
      tabIndex: 3,
      myButtonProps: { tabIndex: 2, style: { color: 'black' } },
    };

    const component1 = create(
      createElement(createComponentWithExtender(customExtend), props)
    );
    const component2 = create(
      createElement(createComponentWithExtender(extendComponentFn), props)
    );

    expect(component1.toJSON()).toEqual(component2.toJSON());
  });
});
