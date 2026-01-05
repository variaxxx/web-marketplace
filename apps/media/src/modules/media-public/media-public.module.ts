import { MediaPublicController } from "./media-public.controller";
import { Module } from "@nestjs/common";

@Module({
  controllers: [MediaPublicController],
})
export class MediaPublicModule {};
