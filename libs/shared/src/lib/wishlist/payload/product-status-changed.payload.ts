import { PRODUCT_STATUS, ProductStatus } from "../../product";
import { IsIn, IsUUID } from "class-validator";

export class ProductStatusChangedPayload {
  @IsUUID()
  productId!: string;

  @IsIn(Object.values(PRODUCT_STATUS))
  newStatus!: ProductStatus;
}
