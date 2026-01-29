import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ListMessagesUseCase } from './list-messages.usecase';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { Message } from 'src/messaging/domain/entities/message.entity';

describe('ListMessagesUseCase', () => {
  let useCase: ListMessagesUseCase;
  let conversationRepository: jest.Mocked<ConversationRepository>;

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
  ): Conversation => ({
    id: 'conv-1',
    chatId: '12345',
    userId: overrides?.userId ?? 'user-1',
    user: overrides?.user ?? makeUser(),
    createdAt: new Date(),
    updatedAt: new Date(),
    messages: overrides?.messages ?? [],
    ...overrides,
  });

  const makeMessage = (overrides?: Partial<Message>): Message => ({
    id: 'msg-1',
    text: 'Hello!',
    type: 'incoming',
    createdAt: new Date(),
    conversation: makeConversation(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListMessagesUseCase,
        {
          provide: CONVERSATION_REPOSITORY,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ListMessagesUseCase);
    conversationRepository = module.get(CONVERSATION_REPOSITORY);
  });

  it('should return messages when user is ADMIN', async () => {
    const adminUser = makeUser({ roles: [ValidRoles.ADMIN] });

    const messages = [
      makeMessage({ id: 'msg-1' }),
      makeMessage({ id: 'msg-2' }),
    ];

    const conversation = makeConversation({
      userId: 'user-1',
      messages,
    });

    conversationRepository.findById.mockResolvedValue(conversation);

    const result = await useCase.execute({
      conversationId: conversation.id,
      currentUser: adminUser,
    });

    expect(result).toEqual(messages);
  });

  it('should return messages when MEMBER owns the conversation', async () => {
    const ownerUser = makeUser({ id: 'user-1', roles: [ValidRoles.MEMBER] });

    const messages = [makeMessage()];

    const conversation = makeConversation({
      userId: ownerUser.id,
      messages,
    });

    conversationRepository.findById.mockResolvedValue(conversation);

    const result = await useCase.execute({
      conversationId: conversation.id,
      currentUser: ownerUser,
    });

    expect(result).toEqual(messages);
  });

  it('should throw ForbiddenException when MEMBER does not own the conversation', async () => {
    const ownerUser = makeUser({ id: 'user-1' });
    const anotherUser = makeUser({ id: 'user-2' });

    const conversation = makeConversation({
      userId: ownerUser.id,
      messages: [makeMessage()],
    });

    conversationRepository.findById.mockResolvedValue(conversation);

    await expect(
      useCase.execute({
        conversationId: conversation.id,
        currentUser: anotherUser,
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw NotFoundException when conversation does not exist', async () => {
    const user = makeUser();

    conversationRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        conversationId: 'conv-404',
        currentUser: user,
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
