import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ProcessTelegramMessageUseCase } from 'src/messaging/application/use-cases/process-telegram-message.usecase';

@Injectable()
export class TelegramPollingService {
  constructor(
    private readonly processTelegramMessageUseCase: ProcessTelegramMessageUseCase,
  ) {}

  @Cron('*/5 * * * * *') // every 5 seconds
  async pollTelegram() {
    await this.processTelegramMessageUseCase.execute();
  }
}
