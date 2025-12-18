import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService],
  imports: [PrismaModule],
})
export class DocumentModule {}
