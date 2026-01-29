import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { TelegramGateway } from '../../domain/ports/telegram-gateway.port';
import { TelegramMessage } from 'src/messaging/application/dto/telegram-message.dto';

@Injectable()
export class TelegramGatewayImpl implements TelegramGateway {
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  private readonly baseUrl = `https://api.telegram.org/bot${this.token}`;

  async getUpdates(): Promise<TelegramMessage[]> {
    const res = await axios.get(`${this.baseUrl}/getUpdates`);
    const updates = res.data.result || [];

    // Map the updates to TelegramMessage DTOs
    return updates.map((u: any) => ({
      chatId: u.message.chat.id.toString(),
      text: u.message.text,
    }));
  }

  async sendMessage(chatId: string, text: string) {
    await axios.post(`${this.baseUrl}/sendMessage`, {
      chat_id: chatId,
      text,
    });
  }
}
