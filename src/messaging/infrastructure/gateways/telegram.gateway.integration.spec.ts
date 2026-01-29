// telegram.gateway.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { TelegramGatewayImpl } from './telegram-gateway.impl';
import { TelegramMessage } from 'src/messaging/application/dto/telegram-message.dto';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TelegramGatewayImpl - Integration', () => {
  let gateway: TelegramGatewayImpl;

  beforeAll(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelegramGatewayImpl,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              if (key === 'telegramBotToken') return 'FAKE_TOKEN';
              if (key === 'telegramBaseUrl')
                return 'https://api.telegram.org/bot';
              return null;
            },
          },
        },
      ],
    }).compile();

    gateway = module.get<TelegramGatewayImpl>(TelegramGatewayImpl);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send a message successfully', async () => {
    const chatId = '123456';
    const text = 'Hello from integration test';

    // Mock axios post response
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        ok: true,
        result: {
          message_id: 1,
          chat: { id: chatId },
          text,
        },
      },
    });

    const response = await gateway.sendMessage(chatId, text);

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `https://api.telegram.org/botFAKE_TOKEN/sendMessage`,
      { chat_id: chatId, text },
    );

    expect(response).toEqual({
      ok: true,
      result: {
        message_id: 1,
        chat: { id: chatId },
        text,
      },
    });
  });

  it('should get updates successfully', async () => {
    const fakeUpdate = {
      update_id: 101,
      message: {
        chat: { id: 123 },
        text: 'Test message',
      },
    };

    mockedAxios.get.mockResolvedValueOnce({
      data: { result: [fakeUpdate] },
    });

    const updates: TelegramMessage[] = await gateway.getUpdates();

    expect(mockedAxios.get).toHaveBeenCalledWith(
      `https://api.telegram.org/botFAKE_TOKEN/getUpdates`,
      { params: { offset: 1, timeout: 0 } },
    );

    expect(updates).toEqual([{ chatId: '123', text: 'Test message' }]);
  });

  it('should return empty array if no updates', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { result: [] },
    });

    const updates = await gateway.getUpdates();

    expect(updates).toEqual([]);
  });
});
