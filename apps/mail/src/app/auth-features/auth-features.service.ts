import { EnvKey } from "../app.module";
import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendEmailVerificationDto } from "@web-marketplace/shared";

@Injectable()
export class AuthFeaturesService {
  private readonly logger = new Logger();

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  // async sendEmail(
  //   dto: SendEmailDto,
  // ) {
  //   try {
  //     const result = await this.mailerService.sendMail({
  //       from: dto.sender,
  //       to: dto.recipients,
  //       subject: dto.subject,
  //       text: dto.text,
  //       html: dto.html,
  //     });

  //     return result;
  //   } catch (e) {
  //     throw new Error(`Error while sending email: ${e instanceof Error ? e.stack : e}`);
  //   }
  // }

  async sendEmailVerification(
    dto: SendEmailVerificationDto,
  ): Promise<void> {
    try {
      const link = `${this.configService.getOrThrow<string>(EnvKey.CONFIRMATION_PAGE_URL)}?token=${dto.token}`;

      Logger.debug(`Email verification token: ${dto.token}`);

      await this.mailerService.sendMail({
        from: { name: "HR", address: "hr@example.com" },
        to: dto.recipient,
        subject: "Confirm registration in WebMarketplace",
        text: `Confirm registration by navigating to this link: ${link}. Ignore if it was not you.`,
        html: `<b>Confirm pls: ${link}</b>`,
      });

      this.logger.log(`Successfully sent email verification to ${dto.recipient}`);
    } catch (e) {
      throw new Error(`Error while sending verification email: ${e instanceof Error ? e.stack : e}`);
    }
  }
}
