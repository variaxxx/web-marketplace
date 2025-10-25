import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map, Observable } from "rxjs";

export interface ApiResponseDto<T> {
  statusCode: number;
  message: string[];
  data: T;
}

@Injectable()
export class ResponseFormatInterceptor<T> implements NestInterceptor<T, ApiResponseDto<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponseDto<T>> | Promise<Observable<ApiResponseDto<T>>> {
    return next.handle().pipe(
      map(data => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        message: [],
        data,
      })),
    );
  }
}
