import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from '../../domain/entities/conversation.entity';
import { Message } from '../../domain/entities/message.entity';
import { ConversationRepository } from '../../domain/ports/conversation-repository.port';

@Injectable()
export class ConversationRepositoryImpl implements ConversationRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,

    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async findOrCreate(chatId: string): Promise<Conversation> {
    let conversation = await this.conversationRepository.findOne({
      where: { chatId },
    });
    if (!conversation) {
      conversation = this.conversationRepository.create({ chatId });
      await this.conversationRepository.save(conversation);
    }
    return conversation;
  }

  findById(conversationId: string): Promise<Conversation | null> {
    return this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });
  }

  async listAll(): Promise<Conversation[]> {
    return this.conversationRepository.find();
  }

  async listByUserId(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
    });
  }

  async addMessage(
    conversationId: string,
    text: string,
    type: 'incoming' | 'outgoing',
  ) {
    const message = this.messageRepository.create({
      conversation: { id: conversationId },
      text,
      type,
    });
    return this.messageRepository.save(message);
  }

  async listMessages(conversationId: string) {
    return this.messageRepository.find({
      where: { conversation: { id: conversationId } },
    });
  }
}
