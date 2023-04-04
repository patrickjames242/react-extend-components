import { Ref } from 'react';
import { ROOT_COMPONENT_LABEL } from '../types';
import { PluckedPropInfo } from './PluckedPropInfo';

export interface InnerComponentsCommunicationContextValue {
  pluckedPropsInfoObj: Record<string, PluckedPropInfo>;
  getProps: (label: ROOT_COMPONENT_LABEL | string) => object;
  outerRef: Ref<any>;
}
