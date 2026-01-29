import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the message',
    example: '4c7fe102-deb7-4f1c-bd6b-75136ae15adf',
  })
  id: string;

  @ApiProperty({
    description: 'Content of the message',
    example: '/start',
  })
  text: string;

  @ApiProperty({
    description: 'Type of message: incoming or outgoing',
    example: 'incoming',
  })
  type: 'incoming' | 'outgoing';

  @ApiProperty({
    description: 'Timestamp when the message was created',
    example: '2026-01-29T17:46:35.398Z',
  })
  createdAt: string;
}
