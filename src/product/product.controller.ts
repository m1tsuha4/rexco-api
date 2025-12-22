import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFiles,
  Query,
  Req,
} from '@nestjs/common';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  CreateProductSchema,
} from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductSchema,
} from './dto/update-product.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guard/jwt-guard.auth';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import {
  UploadImagesInterceptor,
  UploadPdfInterceptor,
  UploadProductFilesInterceptor,
} from 'src/common/interceptors/multer-config.interceptors';
import { ParseJsonPipe } from 'src/common/pipes/parse-json.pipe';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadProductFilesInterceptor()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'REXCO 82 - Brake Cleaner' },
        description: { type: 'string' },
        primaryImage: { type: 'string', format: 'binary' },
        urlYoutube: { type: 'string', example: 'https://youtube.com/...' },

        productFeature: {
          type: 'string',
          example: JSON.stringify([
            {
              color: '#FF0000',
              text: 'Menghilangkan Bunyi Derit',
              order: 1,
            },
            {
              color: '#FF0000',
              text: 'Anti Karat',
              order: 2,
            },
          ]),
        },

        productStore: {
          type: 'string',
          example: JSON.stringify([
            {
              name: '110 ML',
              stores: [
                { name: 'Tokopedia', urlStore: 'https://tokopedia.com' },
              ],
            },
          ]),
        },

        productDocument: {
          type: 'string',
          example: JSON.stringify([{ type: 'MSDS' }, { type: 'TDS' }]),
        },

        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },

        documents: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },

        icon: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @Post()
  create(
    @Body(ParseJsonPipe, new ZodValidationPipe(CreateProductSchema))
    createProductDto: CreateProductDto,
    @UploadedFiles()
    files: {
      primaryImage?: Express.Multer.File[];
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
      icon?: Express.Multer.File[];
    },
  ) {
    return this.productService.create(
      createProductDto,
      files.primaryImage?.[0],
      files.images,
      files.documents,
      files.icon,
    );
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get('list-navbar')
  findAllNavbar() {
    return this.productService.findAllNavbar();
  }

  @Get('all')
  findAllProduct() {
    return this.productService.findAllProduct();
  }

  @Get('search')
  search(@Query('search') search: string) {
    return this.productService.search(search);
  }

  @Get('best-seller')
  bestSeller() {
    return this.productService.bestSeller();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UploadProductFilesInterceptor()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'REXCO 82 - Brake Cleaner' },
        description: { type: 'string' },
        urlYoutube: { type: 'string', example: 'https://youtube.com/...' },

        productFeature: {
          type: 'string',
          example: JSON.stringify([
            {
              text: 'Menghilangkan Bunyi Derit',
              order: 1,
            },
            {
              text: 'Anti Karat',
              order: 2,
            },
          ]),
        },

        productStore: {
          type: 'string',
          example: JSON.stringify([
            {
              name: '110 ML',
              stores: [
                { name: 'Tokopedia', urlStore: 'https://tokopedia.com' },
              ],
            },
          ]),
        },

        productDocument: {
          type: 'string',
          example: JSON.stringify([{ type: 'MSDS' }, { type: 'TDS' }]),
        },

        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },

        documents: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
    },
  })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ParseJsonPipe, new ZodValidationPipe(UpdateProductSchema))
    updateProductDto: UpdateProductDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
      documents?: Express.Multer.File[];
    },
  ) {
    return this.productService.update(
      id,
      updateProductDto,
      files?.images ?? [],
      files?.documents ?? [],
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
