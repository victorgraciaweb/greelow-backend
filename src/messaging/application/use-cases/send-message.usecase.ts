import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Inject,
} from '@nestjs/common';

import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';
import { TelegramGateway } from 'src/messaging/domain/ports/telegram-gateway.port';
import { TELEGRAM_GATEWAY } from 'src/messaging/domain/ports/telegram-gateway.token';
import { User } from 'src/auth/entities/user.entity';
import { Message } from 'src/messaging/domain/entities/message.entity';

@Injectable()
export class SendMessageUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,

    @Inject(TELEGRAM_GATEWAY)
    private readonly telegramGateway: TelegramGateway,
  ) {}

  async execute(
    dto: { conversationId: string; content: string },
    currentUser: User,
  ) {
    const { conversationId, content } = dto;

    const conversation =
      await this.conversationRepository.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    if (
      currentUser.roles.includes(ValidRoles.MEMBER) &&
      conversation.userId !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const message: Message = await this.conversationRepository.addMessage(
      conversationId,
      content,
      'outgoing',
    );

    await this.telegramGateway.sendMessage(conversation.chatId, content);

    return message;
  }
}
