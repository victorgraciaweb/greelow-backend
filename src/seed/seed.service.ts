import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/auth/entities/user.entity';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { Message } from 'src/messaging/domain/entities/message.entity';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async runSeed() {
    await this.clearDatabase();

    const users = await this.insertUsers();
    const conversations = await this.insertConversations(users);
    const messages = await this.insertMessages(conversations);

    return {
      ok: true,
      message: 'Database seeded successfully',
      usersInserted: users.length,
      conversationsInserted: conversations.length,
      messagesInserted: messages.length,
    };
  }

  private async clearDatabase() {
    await this.messageRepository.createQueryBuilder().delete().execute();
    await this.conversationRepository.createQueryBuilder().delete().execute();
    await this.userRepository.createQueryBuilder().delete().execute();
  }

  private async insertUsers(): Promise<User[]> {
    const users: User[] = initialData.users.map((user) => {
      const { password, ...rest } = user;
      return this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });
    });
    return this.userRepository.save(users);
  }

  private async insertConversations(users: User[]): Promise<Conversation[]> {
    const conversations: Conversation[] = [];

    for (const user of users) {
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        const conv = this.conversationRepository.create({
          chatId: `chat-${user.id}-${i}-${Date.now()}`, // ID único
          user,
        });
        conversations.push(conv);
      }
    }

    return this.conversationRepository.save(conversations);
  }

  private async insertMessages(
    conversations: Conversation[],
  ): Promise<Message[]> {
    const messages: Message[] = [];

    for (const conv of conversations) {
      const count = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < count; i++) {
        const type: 'incoming' | 'outgoing' =
          Math.random() > 0.5 ? 'incoming' : 'outgoing';
        const message = this.messageRepository.create({
          conversation: conv,
          text: `Message ${i + 1} for ${conv.chatId}`,
          type,
        });
        messages.push(message);
      }
    }

    await this.messageRepository.save(messages);

    return messages;
  }
}
