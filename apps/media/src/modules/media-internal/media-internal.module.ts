import { MediaInternalController } from "./media-internal.controller";
import { MediaInternalService } from "./media-internal.service";
import { Module } from "@nestjs/common";

@Module({
  controllers: [MediaInternalController],
  providers: [MediaInternalService],
})
export class MediaInternalModule {};
