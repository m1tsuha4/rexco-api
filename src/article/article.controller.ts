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
} from '@nestjs/common';
import { ArticleService } from './article.service';
import {
  CreateArticleDto,
  CreateArticleSchema,
} from './dto/create-article.dto';
import {
  UpdateArticleDto,
  UpdateArticleSchema,
} from './dto/update-article.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { UploadImageInterceptor } from 'src/common/interceptors/multer-config.interceptors';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { ParseJsonPipe } from 'src/common/pipes/parse-json.pipe';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImageInterceptor('article')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        excerpt: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        contentHtml: {
          type: 'string',
          example:
            '<p>Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO</p>',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
        seoTitle: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        seoDescription: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        seoKeywords: {
          type: 'string',
          example: 'Tools',
        },
        metaTags: {
          type: 'object',
          example: {
            title:
              'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
            description:
              'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
            keywords: 'Tools',
          },
        },
        author: {
          type: 'string',
          example: 'REXCO',
        },
        publishedAt: {
          type: 'date',
          example: '2025-12-17T17:07:53.000Z',
        },
      },
    },
  })
  @Post()
  create(
    @Body(new ZodValidationPipe(CreateArticleSchema))
    createArticleDto: CreateArticleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.articleService.create(createArticleDto, file);
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get('image-article')
  findAllImageArticle() {
    return this.articleService.findAllImageArticle();
  }

  @Get('latest')
  findLatest() {
    return this.articleService.findLatest();
  }
  
  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.articleService.findOneBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImageInterceptor('article')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        excerpt: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        contentHtml: {
          type: 'string',
          example:
            '<p>Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO</p>',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
        seoTitle: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        seoDescription: {
          type: 'string',
          example:
            'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
        },
        seoKeywords: {
          type: 'string',
          example: 'Tools',
        },
        metaTags: {
          type: 'object',
          example: {
            title:
              'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
            description:
              'Produk Perawatan Serbaguna untuk Kebutuhan Sehari-hari REXCO',
            keywords: 'Tools',
          },
        },
        author: {
          type: 'string',
          example: 'REXCO',
        },
        publishedAt: {
          type: 'date',
          example: '2025-12-17T17:07:53.000Z',
        },
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ParseJsonPipe, new ZodValidationPipe(UpdateArticleSchema))
    updateArticleDto: UpdateArticleDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.articleService.update(id, updateArticleDto, file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadImageInterceptor('article-image')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('upload-image')
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.articleService.uploadImage(file);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('image/:id')
  removeImage(@Param('id') id: string) {
    return this.articleService.removeImage(id);
  }
}
