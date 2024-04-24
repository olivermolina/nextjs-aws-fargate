/**
 * This file contains the root router of your tRPC-backend
 */
import { router } from 'src/server/trpc';
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import consultationRouter from 'src/server/routers/consultation';
import userRouter from 'src/server/routers/user';
import authRouter from 'src/server/routers/auth';
import invoiceRouter from 'src/server/routers/invoice';
import serviceRouter from 'src/server/routers/service';
import organizationRouter from 'src/server/routers/organization';
import chatRouter from 'src/server/routers/chat';
import extensionRouter from 'src/server/routers/extension';
import templateRouter from 'src/server/routers/template';
import notificationRouter from 'src/server/routers/notification';
import chartRouter from './routers/chart';
import allergyRouter from './routers/allergy';
import problemRouter from './routers/problems';
import historyRouter from './routers/history';
import vitalsRouter from './routers/vitals';
import locationRouter from './routers/location';
import logRouter from './routers/log';
import pdfRouter from './routers/pdf';
import faxRouter from './routers/fax';

export const appRouter = router({
  consultation: consultationRouter,
  user: userRouter,
  auth: authRouter,
  invoice: invoiceRouter,
  service: serviceRouter,
  organization: organizationRouter,
  chat: chatRouter,
  extension: extensionRouter,
  template: templateRouter,
  notification: notificationRouter,
  chart: chartRouter,
  allergy: allergyRouter,
  problem: problemRouter,
  history: historyRouter,
  vitals: vitalsRouter,
  location: locationRouter,
  log: logRouter,
  pdf: pdfRouter,
  fax: faxRouter,
  // TODO add more api routers here
});

export type AppRouter = typeof appRouter;

export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
