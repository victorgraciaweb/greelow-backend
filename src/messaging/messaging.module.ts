import { Module } from '@nestjs/common';
import { ConversationsController } from './api/controllers/conversations.controller';
import { ListConversationsUseCase } from './application/use-cases/list-conversations.usecase';
import { ListMessagesUseCase } from './application/use-cases/list-messages.usecase';
import { SendMessageUseCase } from './application/use-cases/send-message.usecase';
import { ProcessTelegramMessageUseCase } from './application/use-cases/process-telegram-message.usecase';
import { ConversationRepositoryImpl } from './infrastructure/repositories/conversation-repository.impl';
import { TelegramGatewayImpl } from './infrastructure/gateways/telegram-gateway.impl';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './domain/entities/conversation.entity';
import { Message } from './domain/entities/message.entity';
import { CONVERSATION_REPOSITORY } from './domain/ports/conversation-repository.token';
import { TELEGRAM_GATEWAY } from './domain/ports/telegram-gateway.token';
import { ConfigModule } from '@nestjs/config';
import { TelegramPollingService } from './infrastructure/schedulers/telegram-polling.service';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([Conversation, Message]),
  ],
  controllers: [ConversationsController],
  providers: [
    TelegramPollingService,
    ListConversationsUseCase,
    ListMessagesUseCase,
    SendMessageUseCase,
    ProcessTelegramMessageUseCase,
    {
      provide: CONVERSATION_REPOSITORY,
      useClass: ConversationRepositoryImpl,
    },
    {
      provide: TELEGRAM_GATEWAY,
      useClass: TelegramGatewayImpl,
    },
  ],
  exports: [TypeOrmModule],
})
export class MessagingModule {}
