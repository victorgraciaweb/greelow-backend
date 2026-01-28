import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Authentication token service
 *
 * Responsible for generating JWT tokens
 */
@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate JWT token
   *
   * @param payload JWT payload
   * @returns Signed JWT token
   */
  generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
