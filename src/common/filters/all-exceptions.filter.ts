import { Catch, ArgumentsHost, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const isHttpException = exception instanceof HttpException;

        const status = isHttpException
            ? exception.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;

        const error = isHttpException
            ? exception.constructor.name
            : 'Internal Error';

        const { message, details } = this.resolveDetails(exception);

        response.status(status).json({
            statusCode: status,
            error,
            message,
            ...(details ? { details } : {}),
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }

    private resolveDetails(exception: any): { message: string; details?: string[] } {
        if (exception instanceof HttpException) {
            const responseObj = exception.getResponse();
            if (typeof responseObj === 'object' && responseObj !== null) {
                const msg = (responseObj as any).message;
                if (Array.isArray(msg)) {
                    return {
                        message: msg[0] || exception.message,
                        details: msg,
                    };
                }
                return {
                    message: (responseObj as any).message || exception.message,
                };
            }
            return {
                message: exception.message,
            };
        }
        return {
            message: 'Internal Server Error',
        };
    }
}
