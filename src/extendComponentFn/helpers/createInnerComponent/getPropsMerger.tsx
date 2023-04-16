import { ElementType, Ref } from 'react';
import { defaultPropsMergeFn } from '../../../defaultPropsMergeFn';
import {
  ExtendableComponentType,
  PropPath,
  PropsMergeFn,
} from '../../../types';
import { forEachExtendableComponentChild } from '../../../utils/forEachExtendableComponentChild';
import { normalizePropPath } from '../../../utils/normalizePropPath';
import { PluckedPropInfo } from '../initializePluckedProps';
import {
  deleteAtPath,
  getAtPath,
  getPathRelativeToOtherPath,
} from './getAndSetAtPath';

export function getPropsMerger({
  underlyingComponent,
  pluckedProps,
  rootOuterProps,
  innerProps,
  innerRef,
  mergeFunction,
  componentLabel,
}: {
  underlyingComponent: ExtendableComponentType;
  pluckedProps: PluckedPropInfo;
  rootOuterProps: any;
  innerProps: any;
  innerRef: Ref<any> | undefined;
  mergeFunction: PropsMergeFn;
  componentLabel: string;
}): (path: PropPath, type: ElementType | undefined) => any {
  return (path, type) => {
    path = normalizePropPath(path);
    const isRoot = path.length === 0;

    function removeChildPropsFromProps(obj: any): void {
      forEachExtendableComponentChild(underlyingComponent, (child) => {
        const relativePath = getPathRelativeToOtherPath(child.propPath, path);
        if (relativePath) {
          deleteAtPath(obj, relativePath);
        }
      });
    }

    const preparedOuterProps = (() => {
      if (
        pluckedProps.areAllPropsPlucked() ||
        (path.length >= 1 && pluckedProps.isPropPlucked(path[0]!))
      )
        return {};
      const outer: any = { ...(getAtPath(rootOuterProps, path) ?? {}) };
      if (isRoot) {
        for (const key of pluckedProps.getAllPluckedProps()) {
          delete outer[key];
        }
      }
      removeChildPropsFromProps(outer);
      return outer;
    })();

    const preparedInnerProps = (() => {
      const inner: any = { ...(getAtPath(innerProps, path) ?? {}) };
      if (isRoot) {
        delete inner.ref; // because react annoyingly adds a ref getter and setter to props that throws errors to remind us not to try to access it there
        innerRef && (inner.ref = innerRef);
      }
      removeChildPropsFromProps(inner);
      return inner;
    })();

    return mergeFunction({
      innerProps: preparedInnerProps,
      outerProps: preparedOuterProps,
      defaultMergeFn: defaultPropsMergeFn,
      label: componentLabel,
      type,
    });
  };
}
