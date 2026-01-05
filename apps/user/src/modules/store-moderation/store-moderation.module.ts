import { MediaModule } from "../../infra/media/media.module";
import { StoreModerationController } from "./store-moderation.controller";
import { StoreModerationService } from "./store-moderation.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    MediaModule,
  ],
  controllers: [StoreModerationController],
  providers: [StoreModerationService],
})
export class StoreModerationModule {};
