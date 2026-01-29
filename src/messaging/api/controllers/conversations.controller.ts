import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums';
import { SendMessageDto } from 'src/messaging/application/dto/send-message.dto';

import { ListConversationsUseCase } from 'src/messaging/application/use-cases/list-conversations.usecase';
import { ListMessagesUseCase } from 'src/messaging/application/use-cases/list-messages.usecase';
import { SendMessageUseCase } from 'src/messaging/application/use-cases/send-message.usecase';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';

/**
 * ConversationsController
 *
 * Responsibility:
 * - Expose HTTP endpoints related to conversations
 * - Delegate all business logic to application use cases
 *
 * Important:
 * - This controller MUST NOT contain business rules
 * - Authorization rules are enforced via decorators and use cases
 */
@Controller('conversations')
export class ConversationsController {
  constructor(
    /**
     * Use cases are injected directly.
     * The controller does not know anything about repositories or infrastructure.
     */
    private readonly listConversationsUseCase: ListConversationsUseCase,
    private readonly listMessagesUseCase: ListMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
  ) {}

  /**
   * GET /conversations
   *
   * List all conversations visible to the current user.
   *
   * Authorization:
   * - ADMIN: can see all conversations
   * - MEMBER: can see only their own conversations
   *
   * Notes:
   * - The controller does NOT enforce these rules.
   * - The use case decides what data the user can access.
   */
  @Get()
  @Auth(ValidRoles.ADMIN, ValidRoles.MEMBER)
  async listConversations(
    @GetUser() currentUser: User,
  ): Promise<Conversation[]> {
    return this.listConversationsUseCase.execute(currentUser);
  }

  /**
   * GET /conversations/:id/messages
   *
   * List messages of a specific conversation.
   *
   * Authorization:
   * - ADMIN: can access any conversation
   * - MEMBER: can access only conversations they belong to
   *
   * Technical details:
   * - conversationId is validated as UUID using ParseUUIDPipe
   * - The controller only passes data to the use case
   */
  @Get(':id/messages')
  @Auth(ValidRoles.ADMIN, ValidRoles.MEMBER)
  async listMessages(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @GetUser() currentUser: User,
  ): Promise<Conversation['messages']> {
    return this.listMessagesUseCase.execute({
      conversationId,
      currentUser,
    });
  }

  /**
   * POST /conversations/:id/messages
   *
   * Send a message to an existing conversation.
   *
   * Authorization:
   * - ADMIN: can send messages to any conversation
   * - MEMBER: can send messages only to their own conversations
   *
   * Notes:
   * - The controller does not validate ownership
   * - That responsibility belongs to the use case
   */
  @Post(':id/messages')
  @Auth(ValidRoles.ADMIN, ValidRoles.MEMBER)
  async sendMessage(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
    @GetUser() currentUser: User,
  ) {
    return this.sendMessageUseCase.execute(
      {
        conversationId,
        content: dto.content,
      },
      currentUser,
    );
  }
}
