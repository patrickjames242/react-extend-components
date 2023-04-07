import { PropHelpers } from '../../types';
import { PluckedPropInfo } from './initializePluckedProps';

export function getPropHelpers({
  outerProps,
  pluckedPropsInfo,
}: {
  outerProps: any;
  pluckedPropsInfo: PluckedPropInfo;
}): PropHelpers<any> {
  const peek: PropHelpers<any>['peek'] = () => {
    return outerProps;
  };

  const pluck: PropHelpers<Record<string, any>>['pluck'] = (...attributes) => {
    return attributes.reduce((acc, attribute) => {
      pluckedPropsInfo.pluckProp(attribute);
      acc[attribute] = (outerProps as any)[attribute];
      return acc;
    }, {} as any);
  };

  const detectPlucked: PropHelpers<Record<string, any>>['detectPlucked'] =
    (() => {
      // lets cache the result so that subsequent calls to detectPlucked will not have to recompute the result
      let result: any | null = null;
      return () => {
        if (result) return result;
        result = {};
        for (const key in outerProps) {
          Object.defineProperty(result, key, {
            get: () => {
              pluckedPropsInfo.pluckProp(key);
              return (outerProps as any)[key];
            },
          });
        }
        return result;
      };
    })();

  const pluckAll: PropHelpers<any>['pluckAll'] = () => {
    pluckedPropsInfo.pluckAllProps();
    return peek();
  };

  return { peek, pluck, pluckAll, detectPlucked };
}
