import { TelegramMessage } from 'src/messaging/application/dto/telegram-message.dto';

export interface TelegramGateway {
  /**
   * Get updates/messages from Telegram
   */
  getUpdates(): Promise<TelegramMessage[]>;

  /**
   * Send a message to a chat
   */
  sendMessage(chatId: string, text: string): Promise<void>;
}
