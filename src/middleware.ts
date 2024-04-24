import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import loadStytch from 'src/libs/stytch';
import { AppAccess, UserType } from '@prisma/client';
import { paths } from 'src/paths';
import trpcClient from './libs/trpc';

export async function middleware(request: NextRequest) {
  const cookieStore = cookies();
  const stytchSessionJWT = cookieStore.get('stytch_session_jwt');

  if (!stytchSessionJWT) {
    return NextResponse.next();
  }

  try {
    // Authenticate the session JWT. If an error is thrown the session authentication has failed.
    const client = loadStytch();
    const { member_session } = await client.sessions.authenticateJwt({
      session_jwt: stytchSessionJWT.value,
    });

    // If the member session is not found, redirect to the login page.
    if (!member_session.member_id) {
      return NextResponse.redirect(new URL(paths.login, request.url));
    }

    const user = await trpcClient().auth.getMember.query({
      memberId: member_session.member_id,
    });

    if (!user) {
      return NextResponse.next();
    }

    if (request.nextUrl.pathname.startsWith(paths.login)) {
      if (user.type === UserType.PATIENT) {
        return NextResponse.redirect(new URL(paths.patient.account, request.url));
      }

      const cookie = `stytch_session_jwt=${stytchSessionJWT.value}`;
      const gettingStarted = await trpcClient(cookie).organization.gettingStarted.query();
      const isCompleted =
        gettingStarted?.hasPatients &&
        gettingStarted?.hasServices &&
        gettingStarted?.hasGoogleCalendar &&
        gettingStarted?.hasStripe;

      const isSkipGettingStarted = request.nextUrl.searchParams?.get('skip') === 'getting-started';

      if (!isCompleted && !isSkipGettingStarted) {
        console.log('Redirect to getting started page.');
        return NextResponse.redirect(new URL(paths.dashboard.gettingStarted, request.url));
      }

      return NextResponse.redirect(new URL(paths.dashboard.index, request.url));
    }

    if (
      user.type === UserType.PATIENT &&
      request.nextUrl.pathname.startsWith(paths.dashboard.index)
    ) {
      console.log('Patient user has been redirected to the patient dashboard');
      return NextResponse.redirect(new URL(paths.patient.account, request.url));
    }

    if (
      user.type === UserType.STAFF &&
      user.organization.access === AppAccess.Block &&
      !request.nextUrl.pathname.startsWith(paths.dashboard.account) &&
      !request.nextUrl.pathname.startsWith(paths.checkout)
    ) {
      console.log('Staff user has been blocked from accessing the dashboard');
      return NextResponse.redirect(new URL(paths.dashboard.account + '?tab=billing', request.url));
    }
  } catch (e) {
    console.error(e.message);
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
  ],
};
