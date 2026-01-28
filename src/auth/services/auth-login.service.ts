import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthResponseDto, LoginUserDto } from '../dto';
import { User } from '../entities/user.entity';
import { AuthTokenService } from './auth-token.service';
import { UserResponseDto } from '../dto/user-response.dto';

/**
 * Authentication login service
 *
 * Handles user authentication logic
 * Validates credentials and generates JWT tokens
 */
@Injectable()
export class AuthLoginService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly tokenService: AuthTokenService,
  ) {}

  /**
   * Authenticate a user and generate an auth token
   * @param loginUserDto User login data
   * @returns AuthResponseDto
   * @throws UnauthorizedException if credentials are invalid
   */
  async execute(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid (email)');
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Credentials are not valid (password)');
    }

    return new AuthResponseDto(
      new UserResponseDto(user),
      this.tokenService.generateToken({ id: user.id }),
    );
  }
}
