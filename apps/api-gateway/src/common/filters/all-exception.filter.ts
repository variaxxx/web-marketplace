import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { ApiResponse } from "@web-marketplace/shared";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      return void response.status(exception.getStatus()).json({
        statusCode: exception.getStatus(),
        message: typeof exceptionResponse === "object" && "message" in exceptionResponse ? exceptionResponse.message : response,
        data: null,
      } as ApiResponse<null>);
    }

    const clientIp = request.headers["x-forwarded-for"]?.split(",")[0].trim() || request.ip || "unknown";

    Logger.error(`${request.method} ${request.originalUrl} - ${500} Internal server error [IP: ${clientIp}]: ${exception}`);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: ["Internal server error"],
      data: null,
    } as ApiResponse<null>);
  }
}
