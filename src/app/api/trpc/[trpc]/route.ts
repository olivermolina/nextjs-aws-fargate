import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from 'src/server';
import { createContext } from 'src/server/context';
import { NextRequest, NextResponse } from 'next/server';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextRequest, res: NextResponse) => {
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: req,
    router: appRouter,
    createContext: async () =>
      await createContext({
        req: req as unknown as NextApiRequest,
        res: res as unknown as NextApiResponse,
      }),
  });
};

export { handler as GET, handler as POST };
