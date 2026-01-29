import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';

export interface ConversationRepository {
  /**
   * Finds an existing conversation by chat ID or creates a new one if it doesn't exist.
   * @param chatId - The unique identifier of the chat.
   * @returns A promise that resolves to the found or newly created Conversation.
   */
  findOrCreate(chatId: string): Promise<Conversation>;

  /**
   * Finds a conversation by its unique identifier.
   * @param conversationId - The unique identifier of the conversation.
   * @returns A promise that resolves to the Conversation if found, or null if not found.
   */
  findById(conversationId: string): Promise<Conversation | null>;

  /**
   * Lists all conversations in the system.
   * @returns A promise that resolves to an array of all Conversations.
   */
  listAll(pagination?: PaginationDto): Promise<Conversation[]>;

  /**
   * Lists all conversations associated with a specific user ID.
   * @param userId - The unique identifier of the user.
   * @returns A promise that resolves to an array of Conversations associated with the user.
   */
  listByUserId(userId: string): Promise<Conversation[]>;

  /**
   * Adds a message to a specific conversation.
   * @param conversationId - The unique identifier of the conversation.
   * @param text - The content of the message.
   * @param type - The type of the message, either 'incoming' or 'outgoing'.
   * @returns A promise that resolves to the newly added Message.
   */
  addMessage(
    conversationId: string,
    text: string,
    type: 'incoming' | 'outgoing',
  ): Promise<Message>;
}
