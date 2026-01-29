import { Inject, Injectable } from '@nestjs/common';

import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/enums';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Conversation } from 'src/messaging/domain/entities/conversation.entity';
import { ConversationRepository } from 'src/messaging/domain/ports/conversation-repository.port';
import { CONVERSATION_REPOSITORY } from 'src/messaging/domain/ports/conversation-repository.token';

@Injectable()
export class ListConversationsUseCase {
  constructor(
    @Inject(CONVERSATION_REPOSITORY)
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async execute(
    currentUser: User,
    paginationDto: PaginationDto,
  ): Promise<Conversation[]> {
    if (currentUser.roles.includes(ValidRoles.ADMIN)) {
      return this.conversationRepository.listAll(paginationDto);
    }

    return this.conversationRepository.listByUserId(currentUser.id);
  }
}
