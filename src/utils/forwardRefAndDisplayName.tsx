import {
  forwardRef,
  ForwardRefExoticComponent,
  ForwardRefRenderFunction,
  PropsWithoutRef,
  RefAttributes,
} from 'react';

export function forwardRefAndDisplayName<T, P = {}>(
  render: ForwardRefRenderFunction<T, P>
): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>> {
  return new Proxy(forwardRef(render), {
    set: (target, attribute, value) => {
      if (attribute === 'displayName') {
        Object.defineProperty(render, 'name', { value });
        render.displayName = value;
      }
      (target as any)[attribute] = value;
      return true;
    },
  });
}
