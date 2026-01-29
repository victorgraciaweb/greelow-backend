import { Message } from 'src/messaging/domain/entities/message.entity';
import { MessageResponseDto } from '../dto/message-response.dto';

export class MessageMapper {
  static toDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      text: message.text,
      type: message.type,
      createdAt: message.createdAt.toISOString(),
    };
  }

  static toDtos(messages: Message[]): MessageResponseDto[] {
    return messages.map((msg) => this.toDto(msg));
  }
}
