import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl, ip, headers } = req;

    const clientIp = headers["x-forwarded-for"]?.split(",")[0].trim() || ip || "unknown";

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode;
        Logger.log(`${method} ${originalUrl} - ${status} [IP: ${clientIp}]`, "HTTP");
      }),
    );
  }
}
