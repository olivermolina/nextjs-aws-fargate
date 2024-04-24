import { TRPCError } from '@trpc/server';
import { BaseMiddlewareFunctionType } from './BaseMiddlewareFunctionType';
import { t } from '../../trpc';
import { Context } from '../../context';
import { User, Organization, Address } from '@prisma/client';
import prisma from 'src/libs/prisma';

// This is the type of the context that will be passed to the next middleware or procedure.
export type UpdatedContext = Context & {
  user: User & {
    organization: Organization & {
      billing_address: Address | null;
    }
    billing_address: Address | null;
  };
};

/**
 * Will fetch the user from the DB and check to see if they have admin privileges.
 * If they do they will add the user object to subsequent requests for procedural use.
 * @param params middleware parameters
 */
export const middlewareFn: BaseMiddlewareFunctionType<Context, UpdatedContext> = async ({
                                                                                          ctx,
                                                                                          next,
                                                                                        }) => {
  if (!ctx.session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      stytch_member_id: ctx.session.member_id,
    },
    include: {
      organization: {
        include: {
          billing_address: true,
        },
      },
      billing_address: true,
    },
  });

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
};

/**
 * Procedure that will check to see if the user is authenticated.
 */
export const isAuthenticated = t.procedure.use(t.middleware(middlewareFn));
