import {
  createTRPCProxyClient,
  httpBatchLink,
  httpLink,
  loggerLink,
  splitLink,
  TRPCLink,
} from '@trpc/client';
import {observable} from '@trpc/server/observable';
import {getBaseUrl} from 'src/utils/get-base-url';
import {AppRouter} from 'src/server';
import type {inferProcedureInput, inferProcedureOutput} from '@trpc/server';
import superjson from 'superjson';

/**
 *  Custom link to handle authentication
 */
export const customLink: TRPCLink<AppRouter> = () => {
  // here we just got initialized in the app - this happens once per app
  // useful for storing cache for instance
  return ({ next, op }) => {
    // this is when passing the result to the next link
    // each link needs to return an observable which propagates results
    return observable((observer) => {
      return next(op).subscribe({
        next(value) {
          observer.next(value);
        },
        error(err) {
          observer.error(err);
          if (err?.data?.code === 'UNAUTHORIZED') {
            const win: Window = window;
            win.location = '/login';
          }
        },
        complete() {
          observer.complete();
        },
      });
    });
  };
};

/**
 * Links to be used in both client and server
 */
export const trpcLinks = (enableLogger = true, cookie?: string) => [
  customLink,
  loggerLink({
    enabled: (opts) =>
      enableLogger
        ? process.env.NODE_ENV === 'development' ||
        (opts.direction === 'down' && opts.result instanceof Error)
        : false,
  }),
  splitLink({
    condition(op) {
      // check for context property `skipBatch`
      return op.context.skipBatch === true;
    },
    // when condition is true, use normal request
    true: httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      ...(cookie && {
        headers: {
          Cookie: cookie,
        },
      }),
    }),
    // when condition is false, use batching
    false: httpBatchLink({
      url: `/api/trpc`,
      ...(cookie && {
        headers: {
          Cookie: cookie,
        },
      }),
    }),
  }),
];

export const trpcTransformer = superjson;

/**
 * Creates a TRPC client that can be used to make requests to the server from the client.
 */
export const trpcClient = (cookie?: string) =>
  createTRPCProxyClient<AppRouter>({
    transformer: trpcTransformer,
    links: trpcLinks(false, cookie),
  });

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<TRouteKey extends keyof AppRouter['_def']['queries']> =
  inferProcedureOutput<AppRouter['_def']['queries'][TRouteKey]>;

export type inferQueryInput<TRouteKey extends keyof AppRouter['_def']['queries']> =
  inferProcedureInput<AppRouter['_def']['queries'][TRouteKey]>;

export type inferMutationOutput<TRouteKey extends keyof AppRouter['_def']['mutations']> =
  inferProcedureOutput<AppRouter['_def']['mutations'][TRouteKey]>;

export type inferMutationInput<TRouteKey extends keyof AppRouter['_def']['mutations']> =
  inferProcedureInput<AppRouter['_def']['mutations'][TRouteKey]>;

export default trpcClient;
