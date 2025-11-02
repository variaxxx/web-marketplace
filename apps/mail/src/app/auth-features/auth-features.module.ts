import { AuthFeaturesController } from "./auth-features.controller";
import { AuthFeaturesService } from "./auth-features.service";
import { Module } from "@nestjs/common";

@Module({
  imports: [],
  controllers: [AuthFeaturesController],
  providers: [AuthFeaturesService],
})
export class AuthFeaturesModule {};
