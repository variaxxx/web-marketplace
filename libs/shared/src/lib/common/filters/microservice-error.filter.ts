import { Catch, HttpException, HttpStatus, Logger, RpcExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Observable, throwError } from "rxjs";

@Catch()
export class MicroserviceErrorFilter implements RpcExceptionFilter<any> {
  catch(exception: any): Observable<any> {
    const error = exception instanceof RpcException ? exception.getError() : exception;

    // const pattern = ctx.getResponse().args[1];
    const message = error.message ?? error;

    Logger.error(`Something wrong: ${typeof message !== "string" ? JSON.stringify(message) : message}`);

    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return throwError(() => ({
        status: exception.getStatus(),
        message: typeof response === "object" && "message" in response ? response.message : response,
      }));
    }

    if (exception instanceof RpcException) {
      return throwError(() => error);
    }

    return throwError(() => ({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    }));
  }
}
