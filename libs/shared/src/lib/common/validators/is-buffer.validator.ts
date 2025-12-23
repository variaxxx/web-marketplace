import { registerDecorator, ValidationArguments, ValidationOptions } from "class-validator";
import { Buffer } from "node:buffer";

export function IsBuffer(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isBuffer",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return Buffer.isBuffer(value) || value.type === "Buffer";
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a Buffer`;
        },
      },
    });
  };
}
