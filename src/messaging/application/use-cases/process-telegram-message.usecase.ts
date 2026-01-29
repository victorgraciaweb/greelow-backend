import { Injectable } from '@nestjs/common';
import { ConversationRepository } from '../../domain/ports/conversation-repository.port';
import { TelegramGateway } from '../../domain/ports/telegram-gateway.port';

@Injectable()
export class ProcessTelegramMessageUseCase {
  constructor() {
    //private readonly conversationRepo: ConversationRepository,
    //private readonly telegramGateway: TelegramGateway,
  }

  /*async execute(): Promise<void> {
    // 1️⃣ Obtener mensajes nuevos de Telegram
    const updates = await this.telegramGateway.getUpdates();

    for (const update of updates) {
      // 2️⃣ Obtener o crear conversación
      const conversation = await this.conversationRepo.findOrCreate(
        update.chatId,
      );

      // 3️⃣ Guardar mensaje entrante
      await this.conversationRepo.addMessage(
        conversation.id,
        update.text,
        'incoming',
      );

      // 4️⃣ Generar respuesta aleatoria
      const reply = this.getRandomReply();

      // 5️⃣ Enviar respuesta vía Telegram
      await this.telegramGateway.sendMessage(update.chatId, reply);
    }
  }*/
  async execute(): Promise<void> {}

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
