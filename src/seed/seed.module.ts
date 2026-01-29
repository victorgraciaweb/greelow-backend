import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MessagingModule } from 'src/messaging/messaging.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [AuthModule, MessagingModule],
})
export class SeedModule {}
