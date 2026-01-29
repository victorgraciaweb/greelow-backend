import { ApiProperty } from '@nestjs/swagger';

export class ConversationResponseDto {
  @ApiProperty({ example: '83a652a6-bc0b-4357-93e4-9523d8ba7191' })
  id: string;

  @ApiProperty({ example: '1613296396' })
  chatId: string;

  @ApiProperty({
    example: null,
    description: 'Optional userId if conversation belongs to a user',
  })
  userId: string | null;

  @ApiProperty({ example: '2026-01-29T17:46:35.389Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-01-29T17:46:35.389Z' })
  updatedAt: Date;
}
