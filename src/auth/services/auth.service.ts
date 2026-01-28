import { Injectable } from '@nestjs/common';

import { AuthResponseDto, LoginUserDto, RegisterUserDto } from '../dto';

import { User } from '../entities/user.entity';
import { AuthRegisterService } from './auth-register.service';
import { AuthLoginService } from './auth-login.service';
import { AuthRefreshService } from './auth-refresh.service';

/**
 * Authentication service
 *
 * Orchestrates user registration, login, and token refresh operations
 * Delegates to specialized services for each operation
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly registerService: AuthRegisterService,
    private readonly loginService: AuthLoginService,
    private readonly refreshService: AuthRefreshService,
  ) {}

  /**
   * Register a new user
   *
   * - Hashes the password before saving
   * - Generates a JWT token
   *
   * @param registerUserDto User registration data
   * @returns User data with JWT token
   */
  register(registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.registerService.execute(registerUserDto);
  }

  /**
   * Authenticate a user
   *
   * - Validates email and password
   * - Only active users can log in
   * - Generates a JWT token
   *
   * @param loginUserDto Login credentials
   * @returns User data with JWT token
   * @throws UnauthorizedException if credentials are invalid
   */
  login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.loginService.execute(loginUserDto);
  }

  /**
   * Refresh JWT token
   *
   * - Validates the existing token
   * - Generates a new JWT token
   *
   * @param user Authenticated user
   * @returns User data with refreshed JWT token
   */
  refresh(user: User): Promise<AuthResponseDto> {
    return this.refreshService.execute(user);
  }
}
