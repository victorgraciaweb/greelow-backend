import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums';

export class UserResponseDto {
  @ApiProperty({
    example: 'b91605f0-6037-40aa-ba1b-9da1a1362d36',
  })
  id: string;

  @ApiProperty({
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    example: 'Víctor Gracia',
  })
  fullName: string;

  @ApiProperty({
    isArray: true,
    enum: ValidRoles,
    example: [ValidRoles.MEMBER],
  })
  roles: ValidRoles[];

  @ApiProperty({
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: '2025-12-22T05:32:26.374Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-12-22T05:32:26.374Z',
  })
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.fullName = user.fullName;
    this.roles = user.roles;
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
