import {
  ComponentExtenderRenderFnProvider,
  ComponentExtenderWithChildComponentsRenderFnProvider,
  ExtendedComponent,
  FCReturnType,
} from '../../types';
import { extendComponentFn } from '../extendComponentFn';

test('ExtendedComponent type works', () => {
  extendComponentFn('div')((Div) => <Div />) satisfies ExtendedComponent<'div'>;
});

test('ComponentExtenderRenderFnProvider type works', () => {
  extendComponentFn('div') satisfies ComponentExtenderRenderFnProvider<'div'>;
  extendComponentFn(
    'button'
  ) satisfies ComponentExtenderRenderFnProvider<'button'>;
  extendComponentFn('div', {
    child: 'p',
  }) satisfies ComponentExtenderWithChildComponentsRenderFnProvider<
    'div',
    { child: 'p' }
  >;

  // eslint-disable-next-line unused-imports/no-unused-vars
  const CustomComponent = (props: { name: 'patrick'; age: 24 }): FCReturnType =>
    null;

  extendComponentFn(
    CustomComponent
  ) satisfies ComponentExtenderRenderFnProvider<typeof CustomComponent>;
  extendComponentFn(CustomComponent, {
    child: 'p',
  }) satisfies ComponentExtenderWithChildComponentsRenderFnProvider<
    typeof CustomComponent,
    { child: 'p' }
  >;

  extendComponentFn(CustomComponent, {
    child: CustomComponent,
  }) satisfies ComponentExtenderWithChildComponentsRenderFnProvider<
    typeof CustomComponent,
    { child: typeof CustomComponent }
  >;
});
