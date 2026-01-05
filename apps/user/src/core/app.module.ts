import { PrismaModule } from "../infra/db/prisma.module";
import { RmqModule } from "../infra/rmq/rmq.module";
import { AddressModule } from "../modules/address/address.module";
import { SellerApplicationModule } from "../modules/seller-application/seller-application.module";
import { StoreModerationModule } from "../modules/store-moderation/store-moderation.module";
import { StoreModule } from "../modules/store/store.module";
import { UserModule } from "../modules/user/user.module";
import { validationSchema } from "./config/validation.schema";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [
    ConfigModule.forRoot({ validationSchema, isGlobal: true }),
    PrismaModule,
    RmqModule,
    UserModule,
    AddressModule,
    SellerApplicationModule,
    StoreModule,
    StoreModerationModule,
    // WishlistModule,
  ],
})
export class AppModule {}
