import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { SendMessageUseCase } from './send-message.usecase';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { TelegramGateway } from 'src/messaging/domain/ports/telegram-gateway.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';
import { TELEGRAM_GATEWAY } from 'src/messaging/domain/ports/telegram-gateway.token';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { Message } from 'src/messaging/domain/entities/message.entity';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';

describe('SendMessageUseCase', () => {
  let useCase: SendMessageUseCase;
  let conversationRepository: jest.Mocked<ConversationRepository>;
  let telegramGateway: jest.Mocked<TelegramGateway>;

  const makeUser = (overrides?: Partial<User>): User => ({
    id: 'user-1',
    email: 'user@example.com',
    fullName: 'Test User',
    roles: [ValidRoles.MEMBER],
    password: 'hashedpassword',
    isActive: true,
    checkFieldsBeforeInsert: jest.fn(),
    checkFieldsBeforeUpdate: jest.fn(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const makeConversation = (
    overrides?: Partial<Conversation>,
  ): Conversation => {
    const user = overrides?.user ?? makeUser();

    return {
      id: 'conv-1',
      chatId: '12345',
      userId: user.id,
      user,
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      ...overrides,
    };
  };

  const makeMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg-1',
    text: 'Hello!',
    type: 'outgoing',
    createdAt: new Date(),
    conversation: makeConversation(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendMessageUseCase,
        {
          provide: CONVERSATION_REPOSITORY,
          useValue: {
            findById: jest.fn(),
            addMessage: jest.fn(),
          },
        },
        {
          provide: TELEGRAM_GATEWAY,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(SendMessageUseCase);
    conversationRepository = module.get(CONVERSATION_REPOSITORY);
    telegramGateway = module.get(TELEGRAM_GATEWAY);
  });

  it('should send a message successfully', async () => {
    const user = makeUser();
    const conversation = makeConversation({ user });
    const outgoingMessage = makeMessage({ conversation });

    conversationRepository.findById.mockResolvedValue(conversation);
    conversationRepository.addMessage.mockResolvedValue(outgoingMessage);
    telegramGateway.sendMessage.mockResolvedValue(undefined);

    const result = await useCase.execute(
      { conversationId: conversation.id, content: 'Hello!' },
      user,
    );

    expect(result).toEqual(outgoingMessage);

    expect(conversationRepository.findById).toHaveBeenCalledWith(
      conversation.id,
    );
    expect(conversationRepository.addMessage).toHaveBeenCalledWith(
      conversation.id,
      'Hello!',
      'outgoing',
    );
    expect(telegramGateway.sendMessage).toHaveBeenCalledWith(
      conversation.chatId,
      'Hello!',
    );
  });

  it('should throw NotFoundException if conversation does not exist', async () => {
    const user = makeUser();

    conversationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ conversationId: 'conv-1', content: 'Hello!' }, user),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is MEMBER and does not own conversation', async () => {
    const owner = makeUser({ id: 'user-1' });
    const anotherUser = makeUser({ id: 'user-2' });

    const conversation = makeConversation({ user: owner });

    conversationRepository.findById.mockResolvedValue(conversation);

    await expect(
      useCase.execute(
        { conversationId: conversation.id, content: 'Hello!' },
        anotherUser,
      ),
    ).rejects.toThrow(ForbiddenException);

    expect(conversationRepository.addMessage).not.toHaveBeenCalled();
    expect(telegramGateway.sendMessage).not.toHaveBeenCalled();
  });
});
