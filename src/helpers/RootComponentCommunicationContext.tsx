import { createContext, Ref } from 'react';
import { ROOT_COMPONENT_LABEL } from '../types';
import { PluckedPropInfo } from './PluckedPropInfo';

export interface RootComponentCommunicationContextValue {
  pluckedPropsInfoObj: Record<string, PluckedPropInfo>;
  getProps: (label: ROOT_COMPONENT_LABEL | string) => object;
  outerRef: Ref<any>;
}

export const RootComponentCommunicationContext =
  createContext<RootComponentCommunicationContextValue | null>(null);
