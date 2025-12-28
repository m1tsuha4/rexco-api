import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class ArticleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createArticleDto: CreateArticleDto, file?: Express.Multer.File) {
    const slug =
      createArticleDto.slug ??
      slugify(createArticleDto.title, { lower: true, strict: true });
    const slugExist = await this.prisma.article.findUnique({ where: { slug } });

    if (slugExist) {
      throw new BadRequestException('Slug already exists');
    }

    const primaryImage = file ? `/uploads/article/${file.filename}` : null;
    let metaTags: any = undefined;
    if (createArticleDto.metaTags) {
      try {
        metaTags =
          typeof createArticleDto.metaTags === `string`
            ? JSON.parse(createArticleDto.metaTags)
            : createArticleDto.metaTags;
      } catch (error) {
        throw new BadRequestException('Invalid metaTags');
      }
    }

    return this.prisma.article.create({
      data: {
        ...createArticleDto,
        slug,
        primaryImage,
        metaTags,
      },
    });
  }

  async findAll() {
    return this.prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        contentHtml: true,
        primaryImage: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        metaTags: true,
        author: true,
        publishedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findLatest() {
    return this.prisma.article.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        contentHtml: true,
        primaryImage: true,
        seoTitle: true,
        seoDescription: true,
        seoKeywords: true,
        metaTags: true,
        author: true,
        publishedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
  }

  async findOne(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article with ID "${id}" not found`);
    }
    return article;
  }

  async update(
    id: string,
    updateArticleDto: UpdateArticleDto,
    file?: Express.Multer.File,
  ) {
    const article = await this.findOne(id);

    const slug = updateArticleDto.title
      ? slugify(updateArticleDto.title, { lower: true, strict: true })
      : article.slug;

    if (slug !== article.slug) {
      const slugExist = await this.prisma.article.findUnique({
        where: { slug },
      });
      if (slugExist) {
        throw new BadRequestException('Slug already exists');
      }
    }

    const { file: _ignoreFilField, ...rest } = updateArticleDto as any;
    const updateData: any = { ...rest };
    const uploadRoot = join(process.cwd(), 'uploads', 'article');

    let metaTags: any = undefined;
    if (updateArticleDto.metaTags) {
      try {
        metaTags =
          typeof updateArticleDto.metaTags === 'string'
            ? JSON.parse(updateArticleDto.metaTags)
            : updateArticleDto.metaTags;
      } catch (error) {
        throw new BadRequestException('Invalid metaTags');
      }
    }
    updateData.metaTags = metaTags;

    if (file) {
      const primaryImage = `/uploads/article/${file.filename}`;
      updateData.primaryImage = primaryImage;
      if (article.primaryImage && article.primaryImage.length > 0) {
        const fileName = basename(article.primaryImage);
        const filePath = join(uploadRoot, fileName);
        if (existsSync(filePath)) {
          unlinkSync(filePath);
        }
      }
    }

    return this.prisma.article.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const article = await this.findOne(id);
    const uploadRoot = join(process.cwd(), 'uploads', 'article');
    if (article.primaryImage) {
      const fileName = basename(article.primaryImage);
      const filePath = join(uploadRoot, fileName);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }
    return this.prisma.article.delete({ where: { id } });
  }

  async uploadImage(file: Express.Multer.File) {
    return this.prisma.imageArticle.create({
      data: {
        url: `/uploads/article-image/${file.filename}`,
      },
    });
  }

  async findAllImageArticle() {
    return this.prisma.imageArticle.findMany({
      select: {
        id: true,
        url: true,
      },
    });
  }

  async removeImage(id: string) {
    const imageArticle = await this.prisma.imageArticle.findUnique({
      where: {
        id,
      },
    });

    if (!imageArticle) {
      throw new NotFoundException('Image article not found');
    }

    const uploadRoot = join(process.cwd(), 'uploads', 'article-image');
    if (imageArticle.url && imageArticle.url.length > 0) {
      const fileName = basename(imageArticle.url);
      const filePath = join(uploadRoot, fileName);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
    }

    return this.prisma.imageArticle.delete({
      where: {
        id,
      },
    });
  }
}
