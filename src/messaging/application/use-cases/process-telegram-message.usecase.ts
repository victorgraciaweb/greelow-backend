import { Inject, Injectable } from '@nestjs/common';

import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { TelegramGateway } from 'src/messaging/domain/ports/telegram-gateway.port';
import { TELEGRAM_GATEWAY } from 'src/messaging/domain/ports/telegram-gateway.token';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';

@Injectable()
export class ProcessTelegramMessageUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,

    @Inject(TELEGRAM_GATEWAY)
    private readonly telegramGateway: TelegramGateway,
  ) {}

  async execute(): Promise<void> {
    // Fetch updates from Telegram
    const updates = await this.telegramGateway.getUpdates();

    for (const update of updates) {
      // Process each update
      const conversation = await this.conversationRepository.findOrCreate(
        update.chatId,
      );

      // Save message to conversation
      await this.conversationRepository.addMessage(
        conversation.id,
        update.text,
        'incoming',
      );

      // Generate a simple reply
      const reply = this.getRandomReply();

      // Send message back via Telegram
      await this.telegramGateway.sendMessage(update.chatId, reply);

      // Save reply to conversation
      await this.conversationRepository.addMessage(
        conversation.id,
        reply,
        'outgoing',
      );
    }
  }

  private getRandomReply(): string {
    const responses = [
      'Hello!',
      'How are you?',
      'Nice to meet you!',
      'Welcome!',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
}
