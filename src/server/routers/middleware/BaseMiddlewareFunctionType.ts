import { MiddlewareFunction, ProcedureParams } from '@trpc/server';

/**
 * This typescript utility type is used to create a middleware function
 * and override the context type to allow for the middleware to modify
 * the context passed to the next function.
 */
export type BaseMiddlewareFunctionType<$ContextIn, $ContextOut> =
  MiddlewareFunction<
    { _ctx_out: $ContextIn } & ProcedureParams,
    { _ctx_out: $ContextOut } & ProcedureParams
  >;
