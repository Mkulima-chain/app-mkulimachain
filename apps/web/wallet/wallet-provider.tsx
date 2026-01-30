'use client';

import { Provider } from 'jotai';
import { ReactNode } from 'react';
import { EternlErrorHandler } from './eternl-error-handler';

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <EternlErrorHandler />
      {children}
    </Provider>
  );
}