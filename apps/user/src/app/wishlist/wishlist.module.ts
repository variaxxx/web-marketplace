// import { MicroserviceName, MicroserviceRMQQueue } from "../../../../../libs/shared/src";
// import { PrismaModule } from "../../infrastructure/db/prisma.module";
// import { EnvKey } from "../app.module";
// import { WishlistController } from "./wishlist.controller";
// import { WishlistService } from "./wishlist.service";
// import { Module } from "@nestjs/common";
// import { ConfigModule, ConfigService } from "@nestjs/config";
// import { ClientProvider, ClientsModule, Transport } from "@nestjs/microservices";

// @Module({
//   imports: [
//     ClientsModule.registerAsync([
//       {
//         name: MicroserviceName.PRODUCT_SERVICE,
//         imports: [ConfigModule],
//         inject: [ConfigService],
//         useFactory: (config: ConfigService): Promise<ClientProvider> | ClientProvider => ({
//           transport: Transport.RMQ,
//           options: {
//             urls: [config.getOrThrow<string>(EnvKey.RMQ_URL)],
//             queue: MicroserviceRMQQueue.PRODUCT_SERVICE,
//             queueOptions: {
//               durable: true,
//             },
//           },
//         }),
//       },
//     ]),
//     PrismaModule,
//   ],
//   controllers: [
//     WishlistController,
//   ],
//   providers: [
//     WishlistService,
//   ],
// })
// export class WishlistModule {};
