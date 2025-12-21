import { Module } from '@nestjs/common';
import { InstagramService } from './instagram.service';
import { InstagramController } from './instagram.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [InstagramController],
  providers: [InstagramService],
  imports: [PrismaModule],
})
export class InstagramModule {}
