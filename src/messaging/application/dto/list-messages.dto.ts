import { User } from 'src/auth/entities/user.entity';

export interface ListMessagesDto {
  conversationId: string;
  currentUser: User;
}
