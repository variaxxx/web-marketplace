import { AddressModule } from "../modules/address/address.module";
import { AuthModule } from "../modules/auth/auth.module";
import { SellerApplicationModule } from "../modules/seller-application/seller-application.module";
import { StoreModerationModule } from "../modules/store-moderation/store-moderation.module";
import { StoreModule } from "../modules/store/store.module";
import { UserModule } from "../modules/user/user.module";
import { AuthGuard } from "../shared";
import { validationSchema } from "./config/validation.schema";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    JwtModule.register({ global: true }),
    AuthModule,
    UserModule,
    AddressModule,
    SellerApplicationModule,
    StoreModule,
    StoreModerationModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
