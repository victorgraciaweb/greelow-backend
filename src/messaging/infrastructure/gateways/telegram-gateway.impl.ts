import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { TelegramGateway } from 'src/messaging/domain/ports/telegram-gateway.port';
import { TelegramMessage } from 'src/messaging/application/dto/telegram-message.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramGatewayImpl implements TelegramGateway {
  private readonly token: string;
  private readonly baseUrl: string;
  private lastUpdateId: number = 0;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('telegramBotToken');
    this.baseUrl = this.configService.get<string>('telegramBaseUrl');
  }

  async getUpdates(): Promise<TelegramMessage[]> {
    const res = await axios.get(`${this.baseUrl}${this.token}/getUpdates`, {
      params: {
        offset: this.lastUpdateId + 1, // Just get new updates
        timeout: 0, // Optional: long polling
      },
    });

    const updates = res.data.result || [];

    if (updates.length > 0) {
      this.lastUpdateId = updates[updates.length - 1].update_id;
    }

    const messages: TelegramMessage[] = updates.map((u: any) => ({
      chatId: u.message.chat.id.toString(),
      text: u.message.text,
    }));

    if (messages.length > 0) {
      console.log('📨 Messages received from Telegram:', messages);
    }

    return messages;
  }

  async sendMessage(chatId: string, text: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}${this.token}/sendMessage`,
        {
          chat_id: chatId,
          text,
        },
      );

      console.log(`Message sent to chatId ${chatId}: ${text}`);
      console.log('Telegram response:', response.data);

      return response.data;
    } catch (error) {
      console.error(
        'Error sending Telegram message:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }
}
