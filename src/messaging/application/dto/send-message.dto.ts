import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Content of the message to send',
    example: 'Hello! This is a test message',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
