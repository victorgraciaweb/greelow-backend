import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SeedService } from './seed.service';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  /**
   * Run database seed
   *
   * - Clears database
   * - Inserts initial users
   * - Intended for development environments only
   */
  @Post()
  @ApiOperation({
    summary: 'Run database seed',
    description: 'Resets the database and inserts initial seed data.',
  })
  @ApiResponse({
    status: 200,
    description: 'Seed executed successfully',
    example: {
      ok: true,
      message: 'Database seeded successfully',
      usersInserted: 3,
    },
  })
  executeSeed() {
    return this.seedService.runSeed();
  }
}
