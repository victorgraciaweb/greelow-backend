import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsIn,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidRoles } from '../enums/valid-roles.enum';

export class RegisterUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'User password. Must contain uppercase, lowercase and a number or special character',
    minLength: 6,
    maxLength: 50,
    example: 'Password123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Víctor Gracia',
  })
  @IsString()
  @MinLength(1)
  fullName: string;

  @ApiProperty({
    description: 'User role. Only one role is allowed during registration',
    enum: [ValidRoles.MEMBER],
    isArray: true,
    maxItems: 1,
    example: [ValidRoles.MEMBER],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1)
  @IsIn([ValidRoles.MEMBER], { each: true })
  roles: ValidRoles[];
}
