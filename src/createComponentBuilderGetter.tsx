import {
  createElement,
  forwardRef,
  ForwardRefRenderFunction,
  useMemo,
} from 'react';
import { defaultPropsMergeFn } from './defaultPropsMergeFn';
import {
  ComponentBuilderGetter,
  Props,
  PropsMergeFn,
  ReactTag,
  ReactTagProps,
  RefTypeConstraint,
  RenderFn,
  ResultComponentProps,
  RootComponent,
  RootPropsToIncludeConstraint,
} from './types';
import {
  useConsumeObservableValue,
  useCreateValueObservable,
} from './utils/ValueObservable';

export const createComponentBuilderGetter: ComponentBuilderGetter = <
  RootTag extends ReactTag
>(
  rootTag: RootTag,
  builderGetterPropsMergeFn?: PropsMergeFn<RootTag>
) => {
  return <
    AdditionalProps extends object = {},
    RefType extends RefTypeConstraint = 'default',
    RootPropsToInclude extends RootPropsToIncludeConstraint<RootTag> = keyof ReactTagProps<RootTag>
  >(
    renderFn: RenderFn<RootTag, AdditionalProps, RefType, RootPropsToInclude>,
    builderPropsMergeFn?: PropsMergeFn<
      RootTag,
      AdditionalProps,
      RefType,
      RootPropsToInclude
    >
  ) => {
    const Fn: ForwardRefRenderFunction<
      ReactTagProps<ReactTag>['ref'],
      ResultComponentProps<
        RootTag,
        AdditionalProps,
        RefType,
        RootPropsToInclude
      >
    > = (outerProps, outerRef) => {
      const pluckedProps = new Set<string | number | symbol>();
      const pluckAllProps = { pluckAllProps: false }; // we need this to be a reference to an object so that we can mutate it in the pluckAll function

      const observableValues = useCreateValueObservable({
        outerProps,
        pluckedProps,
        pluckAllProps,
      });

      const RootComponentFn: RootComponent<RootTag> = useMemo(
        () => {
          const Fn: ForwardRefRenderFunction<
            ReactTagProps<RootTag>['ref'],
            ReactTagProps<RootTag>
          > = (innerProps, innerRef) => {
            const { outerProps, pluckedProps, pluckAllProps } =
              useConsumeObservableValue(observableValues);

            const preparedOuterProps = (() => {
              if (pluckAllProps.pluckAllProps) return {};
              const outer: any = {
                ...outerProps,
              };
              delete outer.ref; // because react annoyingly adds a ref getter and setter to props that throws errors to remind us not to try to access it there
              outerRef && (outer.ref = outerRef);
              for (const key of pluckedProps) {
                delete outer[key];
              }
              return outer;
            })();

            const preparedInnerProps = (() => {
              const inner: any = { ...innerProps };
              delete inner.ref; // because react annoyingly adds a ref getter and setter to props that throws errors to remind us not to try to access it there
              innerRef && (inner.ref = innerRef);
              return inner;
            })();

            const mergeFn =
              builderPropsMergeFn ??
              builderGetterPropsMergeFn ??
              defaultPropsMergeFn;

            const mergedProps = mergeFn({
              innerProps: preparedInnerProps,
              outerProps: preparedOuterProps,
              defaultMergeFn: defaultPropsMergeFn,
            });

            return createElement(rootTag, mergedProps);
          };
          return forwardRef(Fn) as any;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
      );

      const pluck: Props<
        RootTag,
        AdditionalProps,
        RefType,
        RootPropsToInclude
      >['pluck'] = (...attributes) => {
        return attributes.reduce((acc, attribute) => {
          pluckedProps.add(attribute);
          if (attribute === 'ref') {
            acc[attribute] = outerRef;
          } else {
            acc[attribute] = (outerProps as any)[attribute];
          }
          return acc;
        }, {} as any);
      };

      const pluckAll: Props<
        RootTag,
        AdditionalProps,
        RefType,
        RootPropsToInclude
      >['pluckAll'] = () => {
        const props = { ...outerProps };
        delete props['ref']; // because react annoyingly adds a ref getter and setter to props to remind us not to try to access it there
        if (outerRef) props.ref = outerRef;
        pluckAllProps.pluckAllProps = true;
        return props;
      };

      const peek: Props<
        RootTag,
        AdditionalProps,
        RefType,
        RootPropsToInclude
      >['peek'] = () => {
        const props = { ...outerProps };
        delete props['ref']; // because react annoyingly adds a ref getter and setter to props to remind us not to try to access it there
        if (outerRef) props.ref = outerRef;
        return props;
      };

      return (
        <>
          {renderFn(RootComponentFn, {
            pluckAll,
            pluck,
            peek,
          })}
        </>
      );
    };

    return forwardRef(Fn) as any;
  };
};
