import { ClientProxy, RpcException } from "@nestjs/microservices";
import { catchError, firstValueFrom, Observable, throwError } from "rxjs";

export abstract class BaseRpcController {
  protected send<T = any, V = any>(
    client: ClientProxy,
    pattern: string,
    payload: T,
  ): Promise<V> {
    return firstValueFrom(
      client.send<V>(pattern, payload).pipe(
        catchError(err => throwError(() => new RpcException(err))),
      ),
    );
  }

  protected emit<T>(
    client: ClientProxy,
    pattern: string,
    payload: T,
  ): Observable<void> {
    return client.emit(pattern, payload);
  }
}
