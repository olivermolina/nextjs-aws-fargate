import { createContext } from 'react';

import type { User } from 'src/types/user';
import { Issuer } from 'src/utils/auth';
import { Organization, Status } from '@prisma/client';

export type AuthUser = User & {
  organization: Organization;
};

export interface State {
  isInitialized: boolean;
  organizationStatus: Status;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

export const initialState: State = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  organizationStatus: Status.PENDING,
};

export interface AuthContextType extends State {
  issuer: Issuer.JWT;
  signIn: (email: string, password: string, organizationId: string) => Promise<void>;
  signUp: (user: AuthUser) => Promise<void>;
  signOut: () => Promise<void>;
  setAuthUser: (user: AuthUser) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  ...initialState,
  issuer: Issuer.JWT,
  signIn: () => Promise.resolve(),
  signUp: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  setAuthUser: () => Promise.resolve(),
});
