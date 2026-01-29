import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

export interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: ValidRoles[];
}

export interface SeedConversation {
  userEmail: string;
  chatId: string;
}

export interface SeedMessage {
  chatId: string;
  text: string;
  type: 'incoming' | 'outgoing';
}

export interface SeedData {
  users: SeedUser[];
  conversations: SeedConversation[];
  messages: SeedMessage[];
}

export const initialData: SeedData = {
  users: [
    {
      email: 'admin@gmail.com',
      fullName: 'Admin User',
      password: '1234ABCabc',
      roles: [ValidRoles.ADMIN],
    },
    {
      email: 'member@gmail.com',
      fullName: 'Member User',
      password: '1234ABCabc',
      roles: [ValidRoles.MEMBER],
    },
  ],

  conversations: [
    {
      userEmail: 'admin@gmail.com',
      chatId: '1613296396',
    },
    {
      userEmail: 'member@gmail.com',
      chatId: '6666666666',
    },
  ],

  messages: [
    {
      chatId: '1613296396',
      text: 'Hola admin 👋',
      type: 'incoming',
    },
    {
      chatId: '1613296396',
      text: 'Hola! ¿en qué puedo ayudarte?',
      type: 'outgoing',
    },
    {
      chatId: '1613296396',
      text: 'Hola member 👋',
      type: 'incoming',
    },
  ],
};
