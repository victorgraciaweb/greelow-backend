import { Injectable } from '@nestjs/common';

import { AuthResponseDto } from '../dto';
import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { AuthTokenService } from './auth-token.service';

/**
 * Authentication refresh service
 *
 * Handles token refresh logic
 * Generates new JWT tokens for authenticated users
 */
@Injectable()
export class AuthRefreshService {
  constructor(private readonly tokenService: AuthTokenService) {}

  /**
   * Check authentication status
   *
   * - Used to refresh authentication
   * - Returns a new JWT token
   *
   * @param user Authenticated user
   * @returns User data with refreshed JWT token
   */
  async execute(user: User): Promise<AuthResponseDto> {
    return new AuthResponseDto(
      new UserResponseDto(user),
      this.tokenService.generateToken({ id: user.id }),
    );
  }
}
