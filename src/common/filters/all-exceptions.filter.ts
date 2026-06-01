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

        let message = 'Internal Server Error';
        if (isHttpException) {
            const responseObj = exception.getResponse();
            if (typeof responseObj === 'object' && responseObj !== null) {
                message = (responseObj as any).message || exception.message;
            } else {
                message = exception.message;
            }
        }

        response.status(status).json({
            statusCode: status,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
