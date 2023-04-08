import { PropHelpers } from '../../types';
import { PluckedPropInfo } from './initializePluckedProps';

export function getPropHelpers({
  outerProps,
  pluckedPropsInfo,
}: {
  outerProps: any;
  pluckedPropsInfo: PluckedPropInfo;
}): PropHelpers<any> {
  const peek: PropHelpers<any>['peek'] = (prop?: any) => {
    if (prop != null) {
      return (outerProps as any)[prop];
    }
    return new Proxy(outerProps, {
      set: () => false,
      deleteProperty: () => false,
    });
  };

  const pluck: PropHelpers<Record<string, any>>['pluck'] = (...attributes) => {
    return attributes.reduce((acc, attribute) => {
      pluckedPropsInfo.pluckProp(attribute);
      acc[attribute] = outerProps[attribute];
      return acc;
    }, {} as any);
  };

  const pluckOne: PropHelpers<Record<string, any>>['pluckOne'] = (prop) => {
    pluckedPropsInfo.pluckProp(prop);
    return outerProps[prop];
  };

  const detectPlucked: PropHelpers<
    Record<string, any>
  >['detectPlucked'] = () => {
    return new Proxy(outerProps, {
      get: (target, p) => {
        pluckedPropsInfo.pluckProp(p);
        return target[p];
      },
      deleteProperty: () => false,
      set: () => false,
    });
  };

  const pluckAll: PropHelpers<any>['pluckAll'] = () => {
    pluckedPropsInfo.pluckAllProps();
    return peek();
  };

  return { peek, pluck, pluckAll, detectPlucked, pluckOne };
}
