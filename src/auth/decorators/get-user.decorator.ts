import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * GetUser decorator
 *
 * Extracts the authenticated user from the request object.
 * Can return the entire user object or a specific property.
 *
 * Usage in a controller:
 * @GetUser() user: User                → returns the full user
 * @GetUser('email') email: string      → returns the user's email
 *
 * @param data Optional property of the user to return
 * @param ctx Execution context of the request
 * @returns User object or specific property
 */
export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user)
      throw new InternalServerErrorException('User not found in request');

    return !data ? user : user[data];
  },
);
