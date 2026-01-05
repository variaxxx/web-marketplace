import { OnModuleInit } from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { lastValueFrom, Observable } from "rxjs";

type UnwrapObservable<U> = U extends Observable<infer V> ? V : U;

export abstract class BaseGrpcClient<T extends Record<string, any>> implements OnModuleInit {
  protected service!: T;

  protected constructor(
    private readonly client: ClientGrpc,
    private readonly serviceName: string,
  ) {}

  public onModuleInit(): void {
    this.service = this.client.getService<T>(this.serviceName);
  }

  public async call<K extends keyof T>(
    method: K,
    payload: Parameters<T[K]>[0],
  ): Promise<UnwrapObservable<ReturnType<T[K]>>> {
    const result = await lastValueFrom(this.service[method](payload));
    return result as UnwrapObservable<ReturnType<T[K]>>;
  }
}
