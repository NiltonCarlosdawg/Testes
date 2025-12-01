import { FastifyRequest, FastifyReply, RouteGenericInterface } from 'fastify';
import { Result, AppError } from './result.js';

type ResultControllerFn<T, TRoute extends RouteGenericInterface = RouteGenericInterface> = (
  request: FastifyRequest<TRoute>, 
  reply: FastifyReply
) => Promise<Result<T, AppError>>;

export type ApiResponse<T> = {
  status: "success";
  data: T;
  message?: string;
};

export const handler = <T, TRoute extends RouteGenericInterface = RouteGenericInterface>(
  controllerFn: ResultControllerFn<T, TRoute>
) => {
  return async (request: FastifyRequest<TRoute>, reply: FastifyReply): Promise<void> => {
    try {
      const result = await controllerFn(request, reply);
      
      if (result.success) {
        if (!reply.sent) {
          const isApiResponse = 
            result.value && 
            typeof result.value === 'object' && 
            'status' in result.value && 
            'data' in result.value;
          const response = isApiResponse 
            ? result.value 
            : { status: "success" as const, data: result.value };

          reply.status(200).send(response);
        }
        return;
      }

      const appError = result.error;
      
      if (appError.statusCode >= 500) {
        request.log.error({ error: appError }, `Server Error: ${appError.message}`);
      } else {
        request.log.warn({ error: appError }, `Business Error: ${appError.message}`);
      }

      if (!reply.sent) {
        reply.status(appError.statusCode).send({
          status: "error",
          error: {
            type: appError.type,
            message: appError.message,
            timestamp: appError.timestamp,
            ...(appError.type === 'VALIDATION_ERROR' && { errors: appError.errors }),
            ...(appError.type === 'NOT_FOUND' && { 
              resource: appError.resource,
              resourceId: appError.resourceId 
            }),
            ...(appError.type === 'UNAUTHORIZED' && { reason: appError.reason }),
            ...(appError.type === 'FORBIDDEN' && { requiredPermission: appError.requiredPermission }),
            ...(appError.type === 'CONFLICT' && { 
              conflictingField: appError.conflictingField,
              existingValue: appError.existingValue 
            }),
            ...(appError.type === 'DATABASE_ERROR' && { 
              operation: appError.operation,
              table: appError.table,
              nativeCode: appError.nativeCode 
            }),
            ...(appError.type === 'EXTERNAL_SERVICE_ERROR' && { 
              service: appError.service,
              operation: appError.operation 
            }),
            ...(appError.component && { component: appError.component })
          }
        });
      }
    } catch (unexpectedError) {
      request.log.error({ 
        error: unexpectedError,
        stack: unexpectedError instanceof Error ? unexpectedError.stack : undefined 
      }, 'Unexpected error in handler');
      
      if (!reply.sent) {
        reply.status(500).send({
          status: "error",
          error: {
            type: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
            timestamp: new Date().toISOString()
          }
        });
      }
      throw unexpectedError;
    }
  };
};