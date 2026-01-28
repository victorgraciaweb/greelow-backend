import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../enums';

/**
 * Metadata key used to store required roles for route handlers
 */
export const META_ROLES = 'roles';

/**
 * Role-based access control decorator
 *
 * Attaches required roles metadata to a route handler,
 * which is later evaluated by the UserRoleGuard.
 *
 * @param args Allowed roles for the route
 */
export const RoleProtected = (...args: ValidRoles[]) => {
  return SetMetadata(META_ROLES, args);
};
