import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const error: any = exception.getError();

    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const clientIp = request.headers["x-forwarded-for"]?.split(",")[0].trim() || request.ip || "unknown";

    const status = error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message ? error.message : "Internal server error";

    Logger.error(`${request.method} ${request.originalUrl} - ${status} ${message} [IP: ${clientIp}]`);
    response.status(status).json({ message });
  }
}
