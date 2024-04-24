import { initTRPC } from '@trpc/server';
import { Context } from './context';
import superjson from 'superjson';

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});
export const router = t.router;
export const publicProcedure = t.procedure;
