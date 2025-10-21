import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    if (exception instanceof HttpException)
      return void response.status(exception.getStatus()).json(exception.getResponse());

    const clientIp = request.headers["x-forwarded-for"]?.split(",")[0].trim() || request.ip || "unknown";

    Logger.error(`${request.method} ${request.originalUrl} - ${500} Internal server error [IP: ${clientIp}]: ${exception}`);
    response.status(500).json({ message: "Internal server error" });
  }
}
