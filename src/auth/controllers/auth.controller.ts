import { Controller, Post, Body, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthResponseDto, RegisterUserDto, LoginUserDto } from '../dto';
import { Auth } from '../decorators/auth.decorator';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthService } from '../services/auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   *
   * Endpoint to create a new user in the system.
   * Returns the user info along with a JWT token.
   *
   * @param registerUserDto User registration data
   * @returns AuthResponseDto
   */
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation or business error (e.g. duplicated email)',
    example: {
      message:
        'Duplicate entry error: Key (email)=(user@example.com) already exists.',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({ status: 400, description: 'Validation or business error' })
  register(@Body() registerUserDto: RegisterUserDto): Promise<AuthResponseDto> {
    return this.authService.register(registerUserDto);
  }

  /**
   * Authenticate a user
   *
   * Endpoint for user login.
   * Returns user info and JWT token if credentials are valid.
   *
   * @param loginUserDto User login credentials
   * @returns AuthResponseDto
   */
  @Post('login')
  @ApiOperation({ summary: 'Authenticate a user and return JWT' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    example: {
      message: 'Invalid credentials',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  loginUser(@Body() loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    return this.authService.login(loginUserDto);
  }

  /**
   * Refresh JWT token for an authenticated user
   *
   * Use this endpoint to refresh the JWT token.
   * Requires the user to be authenticated (Bearer token).
   *
   * @param user Authenticated user
   * @returns AuthResponseDto
   */
  @Get('refresh')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Refresh JWT token for authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'JWT refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or invalid JWT token',
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized / invalid token' })
  refreshToken(@GetUser() user: User): Promise<AuthResponseDto> {
    return this.authService.refresh(user);
  }
}
