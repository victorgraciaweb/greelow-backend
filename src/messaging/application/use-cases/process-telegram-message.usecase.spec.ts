import { Test, TestingModule } from '@nestjs/testing';

import { ProcessTelegramMessageUseCase } from './process-telegram-message.usecase';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { TelegramGateway } from 'src/messaging/domain/ports/telegram-gateway.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';
import { TELEGRAM_GATEWAY } from 'src/messaging/domain/ports/telegram-gateway.token';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';

describe('ProcessTelegramMessageUseCase', () => {
  let useCase: ProcessTelegramMessageUseCase;
  let conversationRepository: jest.Mocked<ConversationRepository>;
  let telegramGateway: jest.Mocked<TelegramGateway>;

  const makeConversation = (
    overrides?: Partial<Conversation>,
  ): Conversation => ({
    id: 'conv-1',
    chatId: '12345',
    userId: 'user-1',
    user: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: [],
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessTelegramMessageUseCase,
        {
          provide: CONVERSATION_REPOSITORY,
          useValue: {
            findOrCreate: jest.fn(),
            addMessage: jest.fn(),
          },
        },
        {
          provide: TELEGRAM_GATEWAY,
          useValue: {
            getUpdates: jest.fn(),
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ProcessTelegramMessageUseCase);
    conversationRepository = module.get(CONVERSATION_REPOSITORY);
    telegramGateway = module.get(TELEGRAM_GATEWAY);
  });

  it('should process telegram updates, store messages and reply', async () => {
    const updates = [
      { chatId: '12345', text: 'Hi' },
      { chatId: '67890', text: 'Hello bot' },
    ];

    const conversation1 = makeConversation({ id: 'conv-1', chatId: '12345' });
    const conversation2 = makeConversation({ id: 'conv-2', chatId: '67890' });

    telegramGateway.getUpdates.mockResolvedValue(updates as any);
    conversationRepository.findOrCreate
      .mockResolvedValueOnce(conversation1)
      .mockResolvedValueOnce(conversation2);

    conversationRepository.addMessage.mockResolvedValue(undefined);
    telegramGateway.sendMessage.mockResolvedValue(undefined);

    await useCase.execute();

    // Fetch updates
    expect(telegramGateway.getUpdates).toHaveBeenCalledTimes(1);

    // findOrCreate called per update
    expect(conversationRepository.findOrCreate).toHaveBeenCalledTimes(2);
    expect(conversationRepository.findOrCreate).toHaveBeenNthCalledWith(
      1,
      '12345',
    );
    expect(conversationRepository.findOrCreate).toHaveBeenNthCalledWith(
      2,
      '67890',
    );

    // Incoming messages saved
    expect(conversationRepository.addMessage).toHaveBeenCalledWith(
      conversation1.id,
      'Hi',
      'incoming',
    );
    expect(conversationRepository.addMessage).toHaveBeenCalledWith(
      conversation2.id,
      'Hello bot',
      'incoming',
    );

    // Replies sent
    expect(telegramGateway.sendMessage).toHaveBeenCalledTimes(2);

    // Outgoing messages saved
    expect(conversationRepository.addMessage).toHaveBeenCalledTimes(4);
  });

  it('should do nothing when there are no updates', async () => {
    telegramGateway.getUpdates.mockResolvedValue([]);

    await useCase.execute();

    expect(telegramGateway.getUpdates).toHaveBeenCalledTimes(1);
    expect(conversationRepository.findOrCreate).not.toHaveBeenCalled();
    expect(conversationRepository.addMessage).not.toHaveBeenCalled();
    expect(telegramGateway.sendMessage).not.toHaveBeenCalled();
  });
});
