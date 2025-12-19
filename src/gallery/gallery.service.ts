import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateGalleryDto } from './dto/create-gallery.dto';
import { UpdateGalleryDto } from './dto/update-gallery.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class GalleryService {
  constructor (private readonly prisma: PrismaService) {}
  
  async create(createGalleryDto: CreateGalleryDto, image?: Express.Multer.File) {
    return this.prisma.webGallery.create({
      data: {
        title: createGalleryDto.title,
        image: `/uploads/gallery/${image?.filename}`,
      }
    });
  }

  async findAll() {
    return this.prisma.webGallery.findMany();
  }

  async findOne(id: string) {
    const gallery = await this.prisma.webGallery.findUnique({ where: { id } });
    if (!gallery) {
      throw new BadRequestException('Gallery not found');
    }
    return gallery;
  }

  async update(id: string, updateGalleryDto: UpdateGalleryDto, image?: Express.Multer.File) {
    const gallery = await this.findOne(id);
    if (!gallery) {
      throw new BadRequestException('Gallery not found');
    }
    const uploadRoot = join(process.cwd(), 'uploads', 'gallery');
    if (image) {
      const fileName = basename(gallery.image);
      const oldPath = join(uploadRoot, fileName);
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }
    return this.prisma.webGallery.update({
      where: { id },
      data: {
        title: updateGalleryDto.title,
        image: image ? `/uploads/gallery/${image.filename}` : gallery.image,
      }
    });
  }

  async remove(id: string) {
    const gallery = await this.findOne(id);
    if (!gallery) {
      throw new BadRequestException('Gallery not found');
    }
    const uploadRoot = join(process.cwd(), 'uploads', 'gallery');
    const fileName = basename(gallery.image);
    const oldPath = join(uploadRoot, fileName);
    if (existsSync(oldPath)) {
      unlinkSync(oldPath);
    }
    return this.prisma.webGallery.delete({ where: { id } });
  }
}
