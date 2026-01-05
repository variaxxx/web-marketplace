import { MICROSERVICE_CLIENT_NAMES } from "../../core/config/microservice-client.names";
import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { DeleteFilePayload, MEDIA_PATTERNS } from "@web-marketplace/backend";
import { firstValueFrom } from "rxjs";

@Injectable()
export class MediaService {
  constructor(
    @Inject(MICROSERVICE_CLIENT_NAMES.MEDIA_RMQ) private readonly mediaRmqClient: ClientProxy,
  ) {}

  public deleteFile(
    payload: DeleteFilePayload,
  ): Promise<void> {
    return firstValueFrom(this.mediaRmqClient.emit(MEDIA_PATTERNS.FILE_DELETION, payload));
  };
}
