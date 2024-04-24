import * as trpc from '@trpc/server';
import * as trpcNext from '@trpc/server/adapters/next';
import loadStytch from '../libs/stytch';
import { cookies } from 'next/headers';

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

export async function createContext(opts: trpcNext.CreateNextContextOptions) {
  const cookieStore = cookies();
  const stytchSessionJWT = cookieStore.get('stytch_session_jwt');
  if (!stytchSessionJWT) {
    return { ...opts, session: null, session_jwt: null };
  }

  try {
    // Authenticate the session JWT. If an error is thrown the session authentication has failed.
    const client = loadStytch();
    const { session_jwt, member_session } = await client.sessions.authenticateJwt({
      session_jwt: stytchSessionJWT.value,
    });

    return {
      ...opts,
      session: member_session,
      session_jwt,
      cookies: cookieStore.getAll(),
    };
  } catch (e) {
  }

  return { ...opts, session: null, session_jwt: null, cookies: null };
}
