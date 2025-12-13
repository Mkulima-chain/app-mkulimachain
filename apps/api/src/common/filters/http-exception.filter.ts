import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : exception instanceof Error
          ? exception.message
          : 'Internal server error';

    // Logger l'erreur complète
    this.logger.error(
      `Exception caught: ${JSON.stringify({
        status,
        message,
        path: request.url,
        method: request.method,
        stack: exception instanceof Error ? exception.stack : undefined,
      })}`,
    );

    // Formater la réponse
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message:
        typeof message === 'string'
          ? message
          : (message as any)?.message || 'Internal server error',
      ...(typeof message === 'object' && (message as any)?.message
        ? { details: message }
        : {}),
    };

    response.status(status).json(errorResponse);
  }
}

