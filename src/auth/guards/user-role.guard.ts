import { Reflector } from '@nestjs/core';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { User } from '../entities/user.entity';
import { META_ROLES } from '../decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Validate user roles against required roles defined in route metadata
   *
   * - If no roles are defined, access is allowed
   * - If user has at least one required role, access is granted
   *
   * @param context Execution context
   * @returns boolean indicating whether access is allowed
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Retrieve required roles from route handler metadata
    const validRoles: string[] = this.reflector.get(
      META_ROLES,
      context.getHandler(),
    );

    // If no roles are required, allow access
    if (!validRoles) return true;
    if (validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    // If user is not present in request, authentication failed earlier
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user has at least one of the required roles
    for (const role of user.roles) {
      if (validRoles.includes(role)) {
        return true;
      }
    }

    // User does not have the required roles
    throw new ForbiddenException(
      `User ${user.fullName} need a valid role: [${validRoles}]`,
    );
  }
}
