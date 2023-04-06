import { PropsMergeFn, ROOT_COMPONENT_LABEL } from '../../types';
import { PluckedPropInfo } from './initializePluckedProps';

export interface InnerComponentsCommunicationContextValue {
  getPluckedPropsInfo: (label: string) => PluckedPropInfo;
  getProps: (label: ROOT_COMPONENT_LABEL | string) => object;
  /**
   * The merge function to use to merge props
   */
  mergeFunction: PropsMergeFn;
}
