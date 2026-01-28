import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { AuthResponseDto, RegisterUserDto } from '../dto';
import { User } from '../entities/user.entity';
import { ExceptionHandlerService } from 'src/common/services/exception-handler.service';
import { AuthTokenService } from './auth-token.service';
import { UserResponseDto } from '../dto/user-response.dto';

/**
 * Authentication registration service
 *
 * Handles user registration logic
 * Hashes passwords and generates JWT tokens
 */
@Injectable()
export class AuthRegisterService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    private readonly tokenService: AuthTokenService,
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
  async execute(registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    try {
      const { password, ...userData } = registerUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      const savedUser = await this.userRepository.save(user);

      return new AuthResponseDto(
        new UserResponseDto(savedUser),
        this.tokenService.generateToken({ id: savedUser.id }),
      );
    } catch (error) {
      this.exceptionHandlerService.handleExceptions(error);
    }
  }
}
