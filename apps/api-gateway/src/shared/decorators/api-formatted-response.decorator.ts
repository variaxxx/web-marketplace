import { applyDecorators, HttpStatus, Type } from "@nestjs/common";
import { ApiExtraModels, ApiProperty, ApiResponse, getSchemaPath } from "@nestjs/swagger";

export function ApiFormattedResponse(status: HttpStatus, model: any = null): MethodDecorator {
  if (model === null) {
    return applyDecorators(
      ApiResponse({
        status,
        schema: {
          properties: {
            statusCode: { type: "number", example: status },
            message: { type: "string", example: "OK" },
            data: { type: "null", nullable: true, example: null },
          },
        },
      }),
    );
  }

  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status,
      schema: {
        properties: {
          statusCode: { type: "number", example: status },
          message: { type: "string", example: "OK" },
          data: { $ref: getSchemaPath(model) },
        },
      },
    }),
  );
}

export function ApiFormattedFindManyResponse<T extends Type<any>>(
  status: HttpStatus,
  itemModel: T,
  modelName: string,
): MethodDecorator {
  class PaginatedResponse {
    @ApiProperty({ example: 123 })
    total!: number;

    @ApiProperty({ example: 67 })
    count!: number;

    @ApiProperty({ type: [itemModel] })
    items!: T[];
  }

  Object.defineProperty(PaginatedResponse, "name", {
    value: modelName,
  });

  return applyDecorators(
    ApiExtraModels(itemModel),
    ApiFormattedResponse(status, PaginatedResponse as Type<any>),
  );
}
