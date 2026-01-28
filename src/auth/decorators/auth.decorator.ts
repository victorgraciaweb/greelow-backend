import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../enums';

/**
 * Auth decorator
 *
 * Combines authentication and authorization in a single decorator.
 *
 * - Applies the RoleProtected decorator for role-based authorization
 * - Applies the guards:
 *   - AuthGuard() → validates JWT and attaches the user to the request
 *   - UserRoleGuard → checks that the user has at least one allowed role
 *
 * @param roles List of roles allowed to access the route (optional)
 */
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    // Attach role metadata to the route handler
    RoleProtected(...roles),

    // Apply authentication and role-based guards
    UseGuards(AuthGuard(), UserRoleGuard),
  );
}
