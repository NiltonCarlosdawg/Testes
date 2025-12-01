import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { logHttpRequest, logError } from '../utils/logger.js';
import { DomainException } from '../utils/domain.js';
import { AppError } from '@/utils/result.js';

export const httpLoggingHook = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const start = Date.now();

  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  }, 'Request started');

  reply.raw.on('finish', () => {
    const responseTime = Date.now() - start;
    logHttpRequest(request, reply, responseTime);
    
    request.log.info({
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
    }, 'Request completed');
  });

  done();
};

// const isAppError = (error: unknown): error is AppError => {
//   return (
//     typeof error === 'object' &&
//     error !== null &&
//     'type' in error &&
//     'statusCode' in error &&
//     'message' in error &&
//     'timestamp' in error
//   );
// };

export const errorLoggingHook = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const context = {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    body: request.body,
    params: request.params,
    query: request.query,
  };

  logError(error, context);

  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  }, 'Request error occurred');

  let statusCode = 500;
  let errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : error.message;

  if (error instanceof DomainException) {
    statusCode = error.getStatusCode();
    errorMessage = error.message;

    reply.status(statusCode).send({
      error: {
        message: errorMessage,
        statusCode,
        code: error.code,
        component: error.component,
        timestamp: error.timestamp
      },
    });
    return;
  }

  if (error.name === 'ValidationError' || error.name === 'ZodError') statusCode = 422;
  if (error.name === 'UnauthorizedError') statusCode = 401;
  if (error.name === 'ForbiddenError') statusCode = 403;
  if (error.name === 'NotFoundError') statusCode = 404;

  reply.status(statusCode).send({
    error: {
      message: errorMessage,
      statusCode,
    },
  });
};

export const handleResult = <T>(
  result: { success: boolean; value?: T; error?: AppError },
  reply: FastifyReply
): void => {
  if (result.success && result.value !== undefined) {
    reply.send(result.value);
    return;
  }

  if (!result.success && result.error) {
    const error = result.error;
    
    const errorResponse: Record<string, unknown> = {
      message: error.message,
      statusCode: error.statusCode,
      type: error.type,
      timestamp: error.timestamp,
    };

    if (error.component) {
      errorResponse.component = error.component;
    }

    switch (error.type) {
      case 'VALIDATION_ERROR':
        errorResponse.errors = error.errors;
        break;
      case 'NOT_FOUND':
        if (error.resource) errorResponse.resource = error.resource;
        if (error.resourceId) errorResponse.resourceId = error.resourceId;
        break;
      case 'UNAUTHORIZED':
        if (error.reason) errorResponse.reason = error.reason;
        break;
      case 'FORBIDDEN':
        if (error.requiredPermission) errorResponse.requiredPermission = error.requiredPermission;
        break;
      case 'CONFLICT':
        if (error.conflictingField) errorResponse.conflictingField = error.conflictingField;
        if (error.existingValue) errorResponse.existingValue = error.existingValue;
        break;
      case 'DATABASE_ERROR':
        if (error.operation) errorResponse.operation = error.operation;
        if (error.table) errorResponse.table = error.table;
        if (error.nativeCode) errorResponse.nativeCode = error.nativeCode;
        break;
      case 'EXTERNAL_SERVICE_ERROR':
        errorResponse.service = error.service;
        if (error.operation) errorResponse.operation = error.operation;
        break;
    }

    reply.status(error.statusCode).send({ error: errorResponse });
    return;
  }

  reply.status(500).send({
    error: {
      message: 'Internal Server Error',
      statusCode: 500,
    },
  });
};