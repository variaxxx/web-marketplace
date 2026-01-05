import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { UserRole } from "@web-marketplace/backend";

export const ROLES_KEY = "roles";
export const AllowedRoles = (...roles: UserRole[]): CustomDecorator => SetMetadata(ROLES_KEY, roles);
