import { ValidRoles } from 'src/auth/enums/valid-roles.enum';

export interface SeedUser {
  email: string;
  fullName: string;
  password: string;
  roles: ValidRoles[];
}

export interface SeedData {
  users: SeedUser[];
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
};
