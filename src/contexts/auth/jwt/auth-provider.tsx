import type { FC, ReactNode } from 'react';
import { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

import { Issuer } from 'src/utils/auth';

import type { State } from './auth-context';
import { AuthContext, AuthUser, initialState } from './auth-context';
import { useStytchB2BClient, useStytchMember } from '@stytch/nextjs/b2b';
import { trpc } from 'src/app/_trpc/client';
import toast from 'react-hot-toast';
import { paths } from '../../../paths';
import { useRouter } from '../../../hooks/use-router';
import { useQueryClient } from '@tanstack/react-query';

const STORAGE_KEY = 'accessToken';

enum ActionType {
  INITIALIZE = 'INITIALIZE',
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  SIGN_OUT = 'SIGN_OUT',
}

type InitializeAction = {
  type: ActionType.INITIALIZE;
  payload: {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };
};

type SignInAction = {
  type: ActionType.SIGN_IN;
  payload: {
    user: AuthUser;
  };
};

type SignUpAction = {
  type: ActionType.SIGN_UP;
  payload: {
    user: AuthUser;
  };
};

type SignOutAction = {
  type: ActionType.SIGN_OUT;
};

type Action = InitializeAction | SignInAction | SignUpAction | SignOutAction;

type Handler = (state: State, action: any) => State;

const handlers: Record<ActionType, Handler> = {
  INITIALIZE: (state: State, action: InitializeAction): State => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  },
  SIGN_IN: (state: State, action: SignInAction): State => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  SIGN_UP: (state: State, action: SignUpAction): State => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user,
    };
  },
  SIGN_OUT: (state: State): State => ({
    ...state,
    isAuthenticated: false,
    user: null,
  }),
};

const reducer = (state: State, action: Action): State =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { member, isInitialized } = useStytchMember();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { data } = trpc.auth.getMember.useQuery(
    {
      memberId: member?.member_id || '',
    },
    {
      retry: 1,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      enabled: !!member?.member_id,
    }
  );

  const stytch = useStytchB2BClient();
  const { children } = props;

  const signIn = useCallback(
    async (email: string, password: string, stytchOrganizationId: string): Promise<void> => {
      if (!data) {
        return;
      }

      await stytch.passwords.authenticate({
        organization_id: stytchOrganizationId,
        email_address: email,
        password: password,
        session_duration_minutes: 60,
      });

      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user: data as unknown as AuthUser,
        },
      });
    },
    [dispatch, data]
  );

  const setAuthUser = useCallback(
    async (authUser: AuthUser): Promise<void> => {
      dispatch({
        type: ActionType.SIGN_IN,
        payload: {
          user: authUser,
        },
      });
    },
    [dispatch]
  );

  const signUp = useCallback(
    async (user: AuthUser): Promise<void> => {
      dispatch({
        type: ActionType.SIGN_UP,
        payload: {
          user: user as AuthUser,
        },
      });
    },
    [dispatch, data]
  );

  const signOut = useCallback(async (): Promise<void> => {
    try {
      dispatch({
        type: ActionType.SIGN_OUT,
      });
      queryClient.clear();
      await stytch.session.revoke();
      router.push(paths.login);
    } catch (e) {
      toast.error('Couldn\'t sign out. Please try again.');
    }
  }, [dispatch]);

  useEffect(() => {
    if (member && isInitialized && data) {
      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          isAuthenticated: true,
          user: data as unknown as AuthUser,
        },
      });
    }

    if (!member && isInitialized && !data) {
      dispatch({
        type: ActionType.INITIALIZE,
        payload: {
          isAuthenticated: false,
          user: null,
        },
      });
    }
  }, [member, isInitialized, data]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        issuer: Issuer.JWT,
        signIn,
        signUp,
        signOut,
        setAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
