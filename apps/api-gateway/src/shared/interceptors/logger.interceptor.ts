import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { grpcToHttpStatus } from "@web-marketplace/backend";
import { catchError, Observable, tap, throwError } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, originalUrl, ip, headers } = request;

    const clientIp = headers["x-forwarded-for"]?.split(",")[0].trim() || ip || "unknown";

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode;
        Logger.log(`${method} ${originalUrl} - ${status} [IP: ${clientIp}]`, "HTTP");
      }),
      catchError((e) => {
        if (e instanceof HttpException) {
          const message = e.getResponse();
          Logger.error(`${request.method} ${request.originalUrl} - ${e.getStatus()} ${message} [IP: ${clientIp}]`);
        } else if (
          typeof e === "object"
          && "code" in e
          && "details" in e
        ) {
          Logger.error(`${request.method} ${request.originalUrl} - ${grpcToHttpStatus[e.code]} ${e.details} [IP: ${clientIp}]`);
        } else {
          Logger.error(`${request.method} ${request.originalUrl} - 500 Internal server error [IP: ${clientIp}]: ${e instanceof Error ? e.stack : e}`);
        }
        return throwError(() => e);
      }),
    );
  }
}
