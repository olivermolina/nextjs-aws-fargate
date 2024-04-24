'use client';
import {QueryCache, QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {httpBatchLink, loggerLink, TRPCClientError} from '@trpc/client';
import React, {useState} from 'react';

import {trpc} from './client';
import {trpcTransformer} from 'src/libs/trpc';
import {useRouter} from '../../hooks/use-router';
import {paths} from '../../paths';

export function isTRPCClientError(cause: unknown): cause is TRPCClientError<any> {
  return cause instanceof TRPCClientError;
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 0,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            // TODO - log to error reporting service
            if (isTRPCClientError(error)) {
              // Redirect to dashboard if user is not authorized to view a page or resource
              if (error.data.code === 'FORBIDDEN') {
                router.push(paths.dashboard.index);
              } else if (error.data.code === 'UNAUTHORIZED') {
                router.push(paths.login);
              }
            }
          },
        }),
      }),
  );
  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: trpcTransformer,
      links: [
        /**
         * The function passed to enabled is an example in case you want to the link to
         * log to your console in development and only log errors in production
         */
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `/api/trpc`,
        }),
      ],
    }),
  );
  return (
    <trpc.Provider
      client={trpcClient}
      queryClient={queryClient}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
