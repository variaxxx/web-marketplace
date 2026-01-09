import { RmqService } from "../../infra/rmq/rmq.service";
import { NotificationsService } from "./notifications.service";
import { Controller } from "@nestjs/common";
import { Ctx, EventPattern, Payload, RmqContext } from "@nestjs/microservices";
import { MAIL_RMQ_PATTERN, SellerApplicationReviewedPayload } from "@web-marketplace/backend";

@Controller()
export class NotificationsController {
  constructor(
    private readonly service: NotificationsService,
    private readonly rmq: RmqService,
  ) {}

  @EventPattern(MAIL_RMQ_PATTERN.SELLER_APPLICATION_REVIEWED)
  async sellerAppReviewed(
    @Payload() payload: SellerApplicationReviewedPayload,
    @Ctx() ctx: RmqContext,
  ): Promise<void> {
    try {
      await this.service.sellerAppReviewed(payload);
      this.rmq.ack(ctx);
    } catch (e) {
      this.rmq.nack(ctx, true);
      throw e;
    }
  };
}
