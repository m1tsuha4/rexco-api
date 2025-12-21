import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInstagramDto } from './dto/create-instagram.dto';
import { UpdateInstagramDto } from './dto/update-instagram.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InstagramService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createInstagramDto: CreateInstagramDto) {
    return await this.prisma.instagram.create({
      data: createInstagramDto,
    });
  }

  async findAll() {
    return await this.prisma.instagram.findMany({
      select: {
        id: true,
        title: true,
        link: true,
      },
    });
  }

  async findOne(id: string) {
    const instagram = await this.prisma.instagram.findUnique({
      where: { id },
    });

    if (!instagram) {
      throw new BadRequestException('Instagram not found');
    }

    return instagram;
  }

  async update(id: string, updateInstagramDto: UpdateInstagramDto) {
    const instagram = await this.findOne(id);

    if (!instagram) {
      throw new BadRequestException('Instagram not found');
    }

    return await this.prisma.instagram.update({
      where: { id },
      data: updateInstagramDto,
    });
  }

  async remove(id: string) {
    const instagram = await this.findOne(id);

    if (!instagram) {
      throw new BadRequestException('Instagram not found');
    }

    return await this.prisma.instagram.delete({
      where: { id },
    });
  }
}
