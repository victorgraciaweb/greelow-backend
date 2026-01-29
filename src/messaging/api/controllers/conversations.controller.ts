import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConversationResponseDto } from 'src/messaging/application/dto/conversation-response.dto';
import { MessageResponseDto } from 'src/messaging/application/dto/message-response.dto';
import { SendMessageDto } from 'src/messaging/application/dto/send-message.dto';
import { ConversationMapper } from 'src/messaging/application/mappers/conversation.mapper';
import { MessageMapper } from 'src/messaging/application/mappers/message.mapper';

import { ListConversationsUseCase } from 'src/messaging/application/use-cases/list-conversations.usecase';
import { ListMessagesUseCase } from 'src/messaging/application/use-cases/list-messages.usecase';
import { SendMessageUseCase } from 'src/messaging/application/use-cases/send-message.usecase';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { Message } from 'src/messaging/domain/entities/message.entity';

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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all conversations visible to the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'List of conversations returned successfully',
    type: [Conversation],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - no valid JWT token provided',
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  })
  async listConversations(
    @GetUser() currentUser: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this.listConversationsUseCase.execute(
      currentUser,
      paginationDto,
    );

    return ConversationMapper.toDtos(conversations);
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List all messages of a specific conversation',
  })
  @ApiResponse({
    status: 200,
    description: 'List of messages returned successfully',
    type: [Conversation],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - no valid JWT token provided',
    example: {
      message: 'Unauthorized',
      statusCode: 401,
    },
  })
  async listMessages(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @GetUser() currentUser: User,
  ): Promise<MessageResponseDto[]> {
    const messages = await this.listMessagesUseCase.execute({
      conversationId,
      currentUser,
    });

    return MessageMapper.toDtos(messages);
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
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Send a message to a specific conversation',
  })
  @ApiResponse({
    status: 200,
    description: 'Message sent successfully',
    type: Message,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - invalid data sent to the server',
    example: {
      message: 'Invalid data sent to the server',
      error: 'Bad Request',
      statusCode: 400,
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
    example: {
      message: 'Invalid credentials',
      error: 'Unauthorized',
      statusCode: 401,
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - user cannot access this conversation',
    example: {
      message: 'Access denied',
      error: 'Forbidden',
      statusCode: 403,
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Conversation not found',
    example: {
      message: 'Conversation not found',
      error: 'Not Found',
      statusCode: 404,
    },
  })
  async sendMessage(
    @Param('id', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
    @GetUser() currentUser: User,
  ): Promise<MessageResponseDto> {
    const message = await this.sendMessageUseCase.execute(
      { conversationId, content: dto.content },
      currentUser,
    );

    return MessageMapper.toDto(message);
  }
}
