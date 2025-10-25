import { Address } from "@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface";

export class SendEmailVerificationDto {
  recipient!: string | Address;

  token!: string;
}
