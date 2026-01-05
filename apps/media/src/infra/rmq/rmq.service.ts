import { Injectable, Logger } from "@nestjs/common";
import { RmqContext } from "@nestjs/microservices";

@Injectable()
export class RmqService {
  private readonly logger = new Logger(RmqService.name);

  public ack(context: RmqContext): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    const tag = message?.fields?.deliveryTag;

    if (!tag) return;

    channel.ack(message);

    this.logger.debug(`ACK - ${context.getPattern()} [TAG: ${tag}]`);
  }

  public nack(context: RmqContext, requeue: boolean = false): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    const tag = message?.fields?.deliveryTag;

    if (!tag) return;

    channel.nack(message, false, requeue);

    if (requeue) {
      this.logger.warn(`NACK request - ${context.getPattern()} [TAG: ${tag}]`);
    } else {
      this.logger.error(`NACK drop - ${context.getPattern()} [TAG: ${tag}]`);
    }
  }
}
