import { TemplateService } from "./template.service";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly templateService: TemplateService,
  ) {}

  public async sendEmailVerification(
    recipient: string,
    code: number,
  ): Promise<void> {
    const template = await this.templateService.render("email-verification", {
      code,
      currentYear: new Date().getFullYear(),
    });

    await this.mailerService.sendMail({
      from: { name: "HR", address: "hr@example.com" },
      to: recipient,
      subject: "Confirm your registration in WebMarketplace",
      text: `Someone is trying to register on WebMarketplace using your email. Your registration code: ${code}. Ignore if it was not you.`,
      html: template,
    });
  }

  public async sendSellerApplicationReviewed(
    recipient: string,
    isApproved: boolean,
    storeName: string,
    applicationId: string,
    decisionMadeAt: Date,
    rejectionReason?: string,
  ): Promise<void> {
    const template = await this.templateService.render("seller-application-reviewed", {
      isApproved,
      storeName,
      applicationId,
      reviewDate: new Date(decisionMadeAt).toLocaleString(),
      currentYear: new Date().getFullYear(),
      rejectionReason: !isApproved && rejectionReason ? rejectionReason : undefined,
    });

    await this.mailerService.sendMail({
      from: { name: "HR", address: "hr@example.com" },
      to: recipient,
      subject: "Your seller application status has been updated",
      text: `Your seller application for store ${storeName} has been reviewed by our administration team: ${isApproved ? "Application Approved!" : "Application Rejected"}`,
      html: template,
    });
  }
}
