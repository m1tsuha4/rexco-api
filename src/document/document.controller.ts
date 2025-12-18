import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import {
  CreateDocumentDto,
  CreateDocumentSchema,
} from './dto/create-document.dto';
import {
  UpdateDocumentDto,
  UpdateDocumentSchema,
} from './dto/update-document.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadFilesInterceptor } from 'src/common/interceptors/multer-config.interceptors';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UploadFilesInterceptor({
    imageField: 'images',
    documentField: 'documents',
    imagePath: './uploads/documents/brosur/img',
    documentPath: './uploads/documents/brosur/file',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Document Title',
        },
        images: {
          type: 'string',
          format: 'binary',
        },
        documents: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('brosur')
  create(
    @Body(new ZodValidationPipe(CreateDocumentSchema))
    createDocumentDto: CreateDocumentDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.documentService.create(
      createDocumentDto,
      files?.images?.[0],
      files?.documents?.[0],
    );
  }

  @Get('brosur')
  findAll() {
    return this.documentService.findAll();
  }

  @Get('brosur/:id')
  findOne(@Param('id') id: string) {
    return this.documentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UploadFilesInterceptor({
    imageField: 'images',
    documentField: 'documents',
    imagePath: './uploads/documents/brosur/img',
    documentPath: './uploads/documents/brosur/file',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example: 'Document Title',
        },
        images: {
          type: 'string',
          format: 'binary',
        },
        documents: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Patch('brosur/:id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateDocumentSchema))
    updateDocumentDto: UpdateDocumentDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.documentService.update(
      id,
      updateDocumentDto,
      files?.images?.[0],
      files?.documents?.[0],
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('brosur/:id')
  remove(@Param('id') id: string) {
    return this.documentService.remove(id);
  }
}
