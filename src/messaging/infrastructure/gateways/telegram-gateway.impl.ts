import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TelegramGateway } from '../../domain/ports/telegram-gateway.port';
import { TelegramMessage } from 'src/messaging/application/dto/telegram-message.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramGatewayImpl implements TelegramGateway {
  private readonly token: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.token = this.configService.get<string>('telegramBotToken');
    this.baseUrl = this.configService.get<string>('telegramBaseUrl');
  }

  async getUpdates(): Promise<TelegramMessage[]> {
    const res = await axios.get(`${this.baseUrl}${this.token}/getUpdates`);
    const updates = res.data.result || [];

    console.log('Received Telegram updates:', updates);

    // Map the updates to TelegramMessage DTOs
    return updates.map((u: any) => ({
      chatId: u.message.chat.id.toString(),
      text: u.message.text,
    }));
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

      return response.data; // opcional, si quieres que tu use case reciba info
    } catch (error) {
      console.error(
        'Error sending Telegram message:',
        error.response?.data || error.message,
      );
      throw error; // re-lanzar para que el use case lo capture si quieres manejarlo
    }
  }
}
