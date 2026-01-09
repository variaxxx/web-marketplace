import { MailService } from "../../infra/mail/mail.service";
import { Injectable } from "@nestjs/common";
import { SellerApplicationReviewedPayload } from "@web-marketplace/backend";

@Injectable()
export class NotificationsService {
  constructor(
    private readonly mailService: MailService,
  ) {}

  public async sellerAppReviewed(
    payload: SellerApplicationReviewedPayload,
  ): Promise<void> {
    return this.mailService.sendSellerApplicationReviewed(
      payload.userEmail,
      payload.isApproved,
      payload.storeName,
      payload.applicationId,
      payload.decisionMadeAt,
      payload.rejectionReason,
    );
  }
}
