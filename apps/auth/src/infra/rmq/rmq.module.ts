import { RmqService } from "./rmq.service";
import { Global, Module } from "@nestjs/common";

@Global()
@Module({
  providers: [RmqService],
  exports: [RmqService],
})
export class RmqModule {};
