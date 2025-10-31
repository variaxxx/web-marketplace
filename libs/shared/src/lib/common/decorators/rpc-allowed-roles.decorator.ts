import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { UserRole } from "@web-marketplace/shared";

export const ROLES_KEY = "roles";
export const RpcAllowedRoles = (...roles: UserRole[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);
