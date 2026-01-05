import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { ApiResponse } from "@web-marketplace/api";
import { grpcToHttpStatus } from "@web-marketplace/backend";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status: number = 500;
    let message: string = "Internal server error";

    if (
      typeof exception === "object"
      && "code" in exception
      && "details" in exception
    ) {
      status = grpcToHttpStatus[exception.code];
      message = status < 500 ? exception.details : message;
    }

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
      data: null,
    } as ApiResponse<null>);
  }
}
