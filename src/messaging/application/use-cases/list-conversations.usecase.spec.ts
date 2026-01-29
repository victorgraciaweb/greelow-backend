import { Test, TestingModule } from '@nestjs/testing';

import { ListConversationsUseCase } from './list-conversations.usecase';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

describe('ListConversationsUseCase', () => {
  let useCase: ListConversationsUseCase;
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
    messages: [],
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListConversationsUseCase,
        {
          provide: CONVERSATION_REPOSITORY,
          useValue: {
            listAll: jest.fn(),
            listByUserId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(ListConversationsUseCase);
    conversationRepository = module.get(CONVERSATION_REPOSITORY);
  });

  it('should list all conversations when user is ADMIN', async () => {
    const adminUser = makeUser({ roles: [ValidRoles.ADMIN] });
    const paginationDto: PaginationDto = { limit: 10, offset: 0 };

    const conversations = [
      makeConversation({ id: 'conv-1' }),
      makeConversation({ id: 'conv-2' }),
    ];

    conversationRepository.listAll.mockResolvedValue(conversations);

    const result = await useCase.execute(adminUser, paginationDto);

    expect(result).toEqual(conversations);

    expect(conversationRepository.listAll).toHaveBeenCalledWith(paginationDto);
    expect(conversationRepository.listByUserId).not.toHaveBeenCalled();
  });

  it('should list conversations by user id when user is not ADMIN', async () => {
    const memberUser = makeUser({
      id: 'user-2',
      roles: [ValidRoles.MEMBER],
    });

    const paginationDto: PaginationDto = { limit: 10, offset: 0 };

    const conversations = [makeConversation({ userId: memberUser.id })];

    conversationRepository.listByUserId.mockResolvedValue(conversations);

    const result = await useCase.execute(memberUser, paginationDto);

    expect(result).toEqual(conversations);

    expect(conversationRepository.listByUserId).toHaveBeenCalledWith(
      memberUser.id,
    );
    expect(conversationRepository.listAll).not.toHaveBeenCalled();
  });
});
