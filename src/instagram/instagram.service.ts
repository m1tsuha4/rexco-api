import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateInstagramDto } from './dto/create-instagram.dto';
import { UpdateInstagramDto } from './dto/update-instagram.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import Axios from 'axios';

@Injectable()
export class InstagramService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createInstagramDto: CreateInstagramDto,
    image?: Express.Multer.File,
  ) {
    return await this.prisma.instagram.create({
      data: {
        ...createInstagramDto,
        image: image ? `/uploads/instagram/${image.filename}` : null,
      },
    });
  }

  async findAll(after?: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    console.log({
      userId: process.env.INSTAGRAM_USER_ID,
      tokenExists: !!accessToken,
      tokenLength: accessToken?.length,
    });
    if (!accessToken) {
      throw new InternalServerErrorException(
        'INSTAGRAM_ACCESS_TOKEN environment variable not set',
      );
    }

    if (!process.env.INSTAGRAM_USER_ID) {
      throw new InternalServerErrorException(
        'INSTAGRAM_USER_ID environment variable not set',
      );
    }

    const params: Record<string, any> = {
      fields:
        'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
      limit: 12,
      access_token: accessToken,
    };

    if (after && after.trim() !== '' && after !== 'undefined' && after !== 'null') {
      params.after = after;
    }

    try {
      const response = await Axios.get(
        `https://graph.facebook.com/v23.0/${process.env.INSTAGRAM_USER_ID}/media`,
        {
          params,
        },
        );

      const transformedData = response.data.data.map(
        (item: any) => ({
          id: item.id,
          title: item.caption,
          link: item.permalink,
          image:
            item.media_type === 'VIDEO'
              ? item.thumbnail_url
              : item.media_url,
          created_at: item.timestamp,
        }),
      );

      return {
        posts: transformedData,
        paging: response.data.paging,
      };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Failed to fetch Instagram posts';
      console.error('Instagram API Error:', error.response?.data);

      throw new InternalServerErrorException(errorMessage);
    }
  }

  async findOne(id: string) {
    const instagram = await this.prisma.instagram.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        link: true,
        image: true,
      },
    });

    if (!instagram) {
      throw new BadRequestException('Instagram not found');
    }

    return instagram;
  }

  async update(
    id: string,
    updateInstagramDto: UpdateInstagramDto,
    image?: Express.Multer.File,
  ) {
    const instagram = await this.findOne(id);

    const uploadRoot = join(process.cwd(), 'uploads', 'instagram');
    if (image && instagram.image) {
      const fileName = basename(instagram.image);
      const oldPath = join(uploadRoot, fileName);
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    return await this.prisma.instagram.update({
      where: { id },
      data: {
        ...updateInstagramDto,
        image: image ? `/uploads/instagram/${image.filename}` : instagram.image,
      },
    });
  }

  async remove(id: string) {
    const instagram = await this.findOne(id);

    const uploadRoot = join(process.cwd(), 'uploads', 'instagram');
    if (instagram.image) {
      const fileName = basename(instagram.image);
      const oldPath = join(uploadRoot, fileName);
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    return await this.prisma.instagram.delete({
      where: { id },
    });
  }
}
