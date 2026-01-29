import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ValidRoles } from 'src/auth/enums';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';
import { ListMessagesDto } from '../dto/list-messages.dto';

@Injectable()
export class ListMessagesUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute({
    conversationId,
    currentUser,
  }: ListMessagesDto): Promise<Conversation['messages']> {
    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Admins can see any conversation
    if (currentUser.roles.includes(ValidRoles.ADMIN))
      return conversation.messages;

    // Just Members can see their own conversations
    if (conversation.userId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }

    return conversation.messages;
  }
}
