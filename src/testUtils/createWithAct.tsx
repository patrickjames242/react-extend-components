import { ReactElement } from 'react';
import {
  act,
  create,
  ReactTestRenderer,
  TestRendererOptions,
} from 'react-test-renderer';

export function createWithAct(
  nextElement: ReactElement,
  options?: TestRendererOptions
): ReactTestRenderer {
  let returnVal: ReactTestRenderer;

  act(() => {
    returnVal = create(nextElement, options);
  });

  return returnVal!;
}
