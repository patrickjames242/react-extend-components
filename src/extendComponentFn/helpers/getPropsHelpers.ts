import { Ref } from 'react';
import { PropHelpers } from '../../types';
import { PluckedPropInfo } from './initializePluckedProps';

export function getPropHelpers({
  props,
  ref,
  pluckedPropsInfo,
}: {
  props: any;
  ref: Ref<any> | undefined;
  pluckedPropsInfo: PluckedPropInfo;
}): PropHelpers<any> {
  const peek: PropHelpers<any>['peek'] = () => {
    const _props = { ...props };
    delete props['ref']; // because react annoyingly adds a ref getter and setter to props to remind us not to try to access it there
    if (ref) _props.ref = ref;
    return _props;
  };

  const pluck: PropHelpers<Record<string, any>>['pluck'] = (...attributes) => {
    return attributes.reduce((acc, attribute) => {
      pluckedPropsInfo.pluckProp(attribute);
      if (attribute === 'ref') {
        acc[attribute] = ref;
      } else {
        acc[attribute] = (props as any)[attribute];
      }
      return acc;
    }, {} as any);
  };

  const detectPlucked: PropHelpers<
    Record<string, any>
  >['detectPlucked'] = () => {
    const result: any = {};

    for (const key in props) {
      if (key === 'ref') continue; // because react annoyingly adds a ref getter and setter to props to remind us not to try to access it there
      Object.defineProperty(result, key, {
        get: () => {
          pluckedPropsInfo.pluckProp(key);
          return (props as any)[key];
        },
      });
    }

    Object.defineProperty(result, 'ref', {
      get: () => {
        pluckedPropsInfo.pluckProp('ref');
        return ref;
      },
    });

    return result;
  };

  const pluckAll: PropHelpers<any>['pluckAll'] = () => {
    pluckedPropsInfo.pluckAllProps();
    return peek();
  };

  return { peek, pluck, pluckAll, detectPlucked };
}
