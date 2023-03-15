import { create } from 'react-test-renderer';
import { createComponentBuilderGetter } from './createComponentBuilderGetter';

test('passes props to underlying element', () => {
  const TestComponent = createComponentBuilderGetter('div')((Div) => {
    return <Div />;
  });

  const propsPassedToElement = create(
    <TestComponent title="blah" tabIndex={-1} />
  ).root.findByType('div').props;

  expect(propsPassedToElement).toEqual({ title: 'blah', tabIndex: -1 });
});

test('plucked props are not passed to the underlying element', () => {
  const TestComponent = createComponentBuilderGetter('section')(
    (Section, props) => {
      props.pluck('style', 'className');
      return <Section />;
    }
  );

  const propsPassedToElement = create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  ).root.findByType('section').props;

  expect(propsPassedToElement).toEqual({ id: 'blah' });
});

test('plucked props are returned from the pluck function', () => {
  const TestComponent = createComponentBuilderGetter('input')(
    (Input, props) => {
      const pluckedProps = props.pluck('style', 'className');
      expect(pluckedProps).toEqual({
        style: { color: 'red' },
        className: 'patrick',
      });
      return <Input />;
    }
  );

  create(
    <TestComponent style={{ color: 'red' }} className="patrick" id="blah" />
  );
});

test('when using pluckAll, no props are passed to the underlying element', () => {
  const TestComponent = createComponentBuilderGetter('p')((P, props) => {
    props.pluckAll();
    return <P />;
  });

  const propsPassedToElement = create(
    <TestComponent
      style={{ color: 'red' }}
      className="some-class-name"
      id="blah"
    />
  ).root.findByType('p').props;

  expect(propsPassedToElement).toEqual({});
});
