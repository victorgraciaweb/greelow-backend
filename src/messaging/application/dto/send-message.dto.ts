import { User } from 'src/auth/entities/user.entity';

export interface SendMessageDto {
  conversationId: string;
  content: string;
  currentUser: User;
}
