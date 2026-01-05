import { MICROSERVICE_CLIENT_NAMES } from "../../shared";
import { Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { AUTH_PATTERNS, RevokeRefreshTokenPayload } from "@web-marketplace/backend";
import { Observable } from "rxjs";

export class AuthClientRmq {
  constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.AUTH_RMQ) private readonly rmqClient: ClientProxy,
  ) {}

  public revokeRefreshToken(
    payload: RevokeRefreshTokenPayload,
  ): Observable<void> {
    return this.rmqClient.emit(AUTH_PATTERNS.REVOKE_REFRESH_TOKEN, payload);
  }
}
