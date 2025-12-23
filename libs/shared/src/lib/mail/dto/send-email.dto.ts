import { Address } from "@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface";
import { IsArray, IsOptional, IsString } from "class-validator";

export class SendEmailDto {
  @IsOptional()
  sender?: string | Address;

  @IsArray()
  recipients!: string[] | Address[];

  @IsString()
  subject!: string;

  @IsString()
  text!: string;

  @IsString()
  html?: string;
}
