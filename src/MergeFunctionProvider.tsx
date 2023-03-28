import { createContext, ReactNode, useContext, useMemo } from 'react';
import { FCReturnType, PropsMergeFn } from './types';

export interface MergeFunctionContextValue {
  propsMergeFn: PropsMergeFn | undefined;
}

export const MergeFunctionProviderContext =
  createContext<MergeFunctionContextValue | null>(null);

export function MergeFunctionProvider({
  children,
  propsMergeFn,
}: {
  children?: ReactNode;
  propsMergeFn: PropsMergeFn | undefined;
}): FCReturnType {
  const parentMergeFn = useContext(MergeFunctionProviderContext)?.propsMergeFn;
  const finalMergeFn = propsMergeFn ?? parentMergeFn;

  const value: MergeFunctionContextValue = useMemo(
    () => ({ propsMergeFn: finalMergeFn }),
    [finalMergeFn]
  );
  return (
    <MergeFunctionProviderContext.Provider value={value}>
      {children}
    </MergeFunctionProviderContext.Provider>
  );
}
