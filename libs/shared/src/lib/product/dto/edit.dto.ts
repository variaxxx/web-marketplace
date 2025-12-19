import { CreateProductDto } from "./create.dto";
import { PartialType } from "@nestjs/swagger";

export class EditProductDto extends PartialType(CreateProductDto) {}
