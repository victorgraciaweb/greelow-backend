import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { ConversationResponseDto } from '../dto/conversation-response.dto';

export class ConversationMapper {
  static toDto(conversation: Conversation): ConversationResponseDto {
    return {
      id: conversation.id,
      chatId: conversation.chatId,
      userId: conversation.userId ?? null,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  static toDtos(conversations: Conversation[]): ConversationResponseDto[] {
    return conversations.map((conv) => this.toDto(conv));
  }
}
