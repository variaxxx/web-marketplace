import { ArgumentsHost, Catch, HttpStatus, Logger, RpcExceptionFilter } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { Observable, throwError } from "rxjs";

@Catch()
export class MicroserviceErrorFilter implements RpcExceptionFilter<any> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToHttp();
    const error = exception instanceof RpcException ? exception.getError() : exception;

    const pattern = ctx.getResponse().args[1];
    const message = error.message ?? error;

    Logger.error(`Something wrong in ${pattern}: ${message}`);

    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    return throwError(() => new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    }));
  }
}
