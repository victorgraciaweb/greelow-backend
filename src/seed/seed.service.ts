import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from 'src/auth/entities/user.entity';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.clearDatabase();

    const users = await this.insertUsers();

    return {
      ok: true,
      message: 'Database seeded successfully',
      usersInserted: users.length,
    };
  }

  private async clearDatabase() {
    await this.userRepository.createQueryBuilder().delete().where({}).execute();
  }

  private async insertUsers(): Promise<User[]> {
    const users: User[] = initialData.users.map((user) => {
      const { password, ...rest } = user;
      return this.userRepository.create({
        ...rest,
        password: bcrypt.hashSync(password, 10),
      });
    });

    return this.userRepository.save(users);
  }
}
