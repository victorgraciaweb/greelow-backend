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

  // ---------------- USERS ----------------

  private async insertUsers(): Promise<User[]> {
    const users = initialData.users.map((user) => {
      const { password, ...rest } = user;

      return this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });
    });

    return this.userRepository.save(users);
  }

  // ---------------- CONVERSATIONS ----------------

  private async insertConversations(users: User[]): Promise<Conversation[]> {
    const userByEmail = new Map(users.map((user) => [user.email, user]));

    const conversations = initialData.conversations.map((conv) => {
      const user = userByEmail.get(conv.userEmail);

      if (!user) {
        throw new Error(`User not found for email: ${conv.userEmail}`);
      }

      return this.conversationRepository.create({
        chatId: conv.chatId,
        user,
      });
    });

    return this.conversationRepository.save(conversations);
  }

  // ---------------- MESSAGES ----------------

  private async insertMessages(
    conversations: Conversation[],
  ): Promise<Message[]> {
    const conversationByChatId = new Map(
      conversations.map((conv) => [conv.chatId, conv]),
    );

    const messages = initialData.messages.map((msg) => {
      const conversation = conversationByChatId.get(msg.chatId);

      if (!conversation) {
        throw new Error(`Conversation not found for chatId: ${msg.chatId}`);
      }

      return this.messageRepository.create({
        conversation,
        text: msg.text,
        type: msg.type,
      });
    });

    return this.messageRepository.save(messages);
  }
}
