import { createContext, Ref } from 'react';
import { ROOT_COMPONENT_LABEL } from '../types';
import { PluckedPropInfo } from './PluckedPropInfo';

export interface __RootComponentCommunicationContextValue {
  pluckedPropsInfoObj: Record<string, PluckedPropInfo>;
  getProps: (label: ROOT_COMPONENT_LABEL | string) => object;
  outerRef: Ref<any>;
}

export const __RootComponentCommunicationContext =
  createContext<__RootComponentCommunicationContextValue | null>(null);
