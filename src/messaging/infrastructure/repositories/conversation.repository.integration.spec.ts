import { Test, TestingModule } from '@nestjs/testing';
import { ConversationRepositoryImpl } from './conversation-repository.impl';

describe('ConversationRepositoryImpl (integration-light)', () => {
  let repository: ConversationRepositoryImpl;

  let convCounter = 1;
  let msgCounter = 1;

  const mockConversationRepo = {
    findOne: jest.fn(),
    save: jest.fn((conv) => conv),
    find: jest.fn(),
    clear: jest.fn(),
    create: jest.fn((data) => ({
      id: `conv-${convCounter++}`,
      ...data,
    })),
  };

  const mockMessageRepo = {
    create: jest.fn((data) => ({
      id: `msg-${msgCounter++}`,
      ...data,
    })),
    save: jest.fn((msg) => msg),
    find: jest.fn(),
    clear: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationRepositoryImpl,
        { provide: 'ConversationRepository', useValue: mockConversationRepo },
        { provide: 'MessageRepository', useValue: mockMessageRepo },
      ],
    }).compile();

    repository = module.get<ConversationRepositoryImpl>(
      ConversationRepositoryImpl,
    );

    jest.clearAllMocks();
    convCounter = 1;
    msgCounter = 1;
  });

  it('should create a conversation if it does not exist', async () => {
    mockConversationRepo.findOne.mockResolvedValueOnce(null);

    const conv = await repository.findOrCreate('chat1');

    expect(conv).toHaveProperty('id'); // ✅ existe id
    expect(conv.chatId).toBe('chat1');
    expect(mockConversationRepo.findOne).toHaveBeenCalledWith({
      where: { chatId: 'chat1' },
    });
    expect(mockConversationRepo.save).toHaveBeenCalledWith(conv);
  });

  it('should return existing conversation if it exists', async () => {
    const existingConv = { id: 'conv-1', chatId: 'chat2' };
    mockConversationRepo.findOne.mockResolvedValueOnce(existingConv);

    const conv = await repository.findOrCreate('chat2');

    expect(conv.id).toBe('conv-1');
    expect(conv.chatId).toBe('chat2');
    expect(mockConversationRepo.save).not.toHaveBeenCalled();
  });

  it('should add a message to a conversation', async () => {
    const conv = { id: 'conv-3', chatId: 'chat3' };

    const msg = await repository.addMessage(conv.id, 'Hello', 'outgoing');

    expect(msg).toHaveProperty('id');
    expect(msg.text).toBe('Hello');
    expect(msg.type).toBe('outgoing');

    expect(mockMessageRepo.create).toHaveBeenCalledWith({
      conversation: { id: conv.id },
      text: 'Hello',
      type: 'outgoing',
    });

    expect(mockMessageRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        conversation: { id: conv.id },
        text: 'Hello',
        type: 'outgoing',
      }),
    );
  });

  it('should list all conversations', async () => {
    const allConvs = [
      { id: 'conv-4', chatId: 'chat4' },
      { id: 'conv-5', chatId: 'chat5' },
    ];
    mockConversationRepo.find.mockResolvedValueOnce(allConvs);

    const result = await repository.listAll();

    expect(result.length).toBe(2);
    expect(result.map((c) => c.chatId)).toEqual(
      expect.arrayContaining(['chat4', 'chat5']),
    );
    expect(mockConversationRepo.find).toHaveBeenCalled();
  });

  it('should list conversations by userId (optional)', async () => {
    const conv = { id: 'conv-6', chatId: 'chat6', userId: 'user-123' };
    mockConversationRepo.find.mockResolvedValueOnce([conv]);

    const result = await repository.listByUserId('user-123');

    expect(result.length).toBe(1);
    expect(result[0].chatId).toBe('chat6');
    expect(mockConversationRepo.find).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
    });
  });
});
