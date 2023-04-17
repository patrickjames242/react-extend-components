import { create } from 'react-test-renderer';
import {
  CanHaveExtendableComponentInfo,
  EXTENDABLE_COMPONENT_INFO,
  FCReturnType,
} from '../../types';
import { extendComponentFn } from '../extendComponentFn';

test('treats child component prop like separate component', () => {
  const MyComponentWithChildComponents = (props: {
    buttonProps?: { title?: string; className?: string };
  }): FCReturnType => {
    return <button {...props.buttonProps}></button>;
  };

  (MyComponentWithChildComponents as CanHaveExtendableComponentInfo)[
    EXTENDABLE_COMPONENT_INFO
  ] = {
    childComponents: [{ propPath: 'buttonProps', type: 'button' }],
  };

  const ResultComponent = extendComponentFn(MyComponentWithChildComponents)(
    (Root) => {
      return <Root buttonProps={{ className: 'blah' }}></Root>;
    }
  );

  const component = create(
    <ResultComponent buttonProps={{ title: 'patrick' }} />
  );

  expect(component.root.findByType('button').props).toEqual({
    className: 'blah',
    title: 'patrick',
  });
});

test('treats nested child component props like separate components', () => {
  const MyComponentWithChildComponents = (props: {
    buttonProps?: {
      title?: string;
      className?: string;
      divProps?: { tabIndex?: number; className?: string };
    };
  }): FCReturnType => {
    return <button {...props.buttonProps}></button>;
  };

  (MyComponentWithChildComponents as CanHaveExtendableComponentInfo)[
    EXTENDABLE_COMPONENT_INFO
  ] = {
    childComponents: [
      { propPath: 'buttonProps', type: 'button' },
      { propPath: ['buttonProps', 'divProps'], type: 'div' },
    ],
  };

  const ResultComponent = extendComponentFn(MyComponentWithChildComponents)(
    (Root) => {
      return (
        <Root
          buttonProps={{
            className: 'blah',
            divProps: { tabIndex: -3, className: 'dora' },
          }}
        ></Root>
      );
    }
  );

  const component = create(
    <ResultComponent
      buttonProps={{ title: 'patrick', divProps: { className: 'boots' } }}
    />
  );

  expect(component.root.findByType('button').props).toEqual({
    className: 'blah',
    title: 'patrick',
    divProps: {
      className: 'dora boots',
      tabIndex: -3,
    },
  });
});

test('child component props are set and observed for components created with the extend function', () => {
  const MyComponent = extendComponentFn('div', { myButton: 'button' })(
    (Root, { MyButton }) => (
      <Root>
        <MyButton />
      </Root>
    )
  );

  const OtherComponent = extendComponentFn(MyComponent)((Root) => {
    return (
      <Root
        className="red"
        tabIndex={-4}
        style={{ backgroundColor: 'red' }}
        myButtonProps={{
          className: 'patrick',
          style: { color: 'purple' },
          title: 'blah',
        }}
      />
    );
  });

  const component = create(
    <OtherComponent
      className="blah"
      myButtonProps={{
        title: 'patrick',
        className: 'block',
        style: { zIndex: -5 },
      }}
    />
  );

  expect(component.root.findByType('button').props).toEqual({
    className: 'patrick block',
    title: 'patrick',
    style: {
      color: 'purple',
      zIndex: -5,
    },
  });

  expect(component.root.findByType('div').props).toEqual({
    className: 'red blah',
    tabIndex: -4,
    style: {
      backgroundColor: 'red',
    },
    children: expect.anything(),
  });
});
