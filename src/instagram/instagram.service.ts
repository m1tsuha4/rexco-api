import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInstagramDto } from './dto/create-instagram.dto';
import { UpdateInstagramDto } from './dto/update-instagram.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

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

  async findAll() {
    return await this.prisma.instagram.findMany({
      select: {
        id: true,
        title: true,
        link: true,
        image: true,
      },
    });
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
