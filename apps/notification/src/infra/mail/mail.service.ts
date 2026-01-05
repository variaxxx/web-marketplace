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
    const template = await this.templateService.render("email-verification", { code });

    await this.mailerService.sendMail({
      from: { name: "HR", address: "hr@example.com" },
      to: recipient,
      subject: "Confirm your registration in WebMarketplace",
      text: `Someone is trying to register on WebMarketplace using your email. Your registration code: ${code}. Ignore if it was not you.`,
      html: template,
    });
  }
}
