import { IsUUID } from "class-validator";

export class FindOneProductPayload {
  @IsUUID()
  id!: string;
}
