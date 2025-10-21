import { ArgumentsHost, Catch, RpcExceptionFilter } from "@nestjs/common";
import { Observable, throwError } from "rxjs";

@Catch()
export class MicroserviceErrorFilter implements RpcExceptionFilter<any> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    console.log("error!!!");
    return throwError(() => exception);
  }
}
