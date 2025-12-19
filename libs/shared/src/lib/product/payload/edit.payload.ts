import { CreateProductPayload } from "./create.payload";
import { PartialType } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class EditProductPayload extends PartialType(CreateProductPayload) {
  @IsUUID()
  id!: string;
}
