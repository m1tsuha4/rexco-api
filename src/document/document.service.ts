import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { basename, join } from 'path';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    image?: Express.Multer.File,
    file?: Express.Multer.File,
  ) {
    if (!image || !file) {
      throw new BadRequestException('Image and file are required');
    }

    const document = await this.prisma.document.create({
      data: {
        title: createDocumentDto.title,
        image: `/uploads/documents/brosur/img/${image?.filename}`,
        file: `/uploads/documents/brosur/file/${file?.filename}`,
      },
    });

    return document;
  }

  async findAll() {
    return await this.prisma.document.findMany({
      select: {
        id: true,
        title: true,
        image: true,
        file: true,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.document.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        image: true,
        file: true,
      },
    });
  }

  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    image?: Express.Multer.File,
    file?: Express.Multer.File,
  ) {
    const document = await this.findOne(id);
    if (!document) {
      throw new BadRequestException('Document not found');
    }

    const {
      image: _ignoreImage,
      file: _ignoreFile,
      ...rest
    } = updateDocumentDto as any;
    const updateData: any = { ...rest };
    const uploadRoot = join(process.cwd(), 'uploads', 'documents', 'brosur');
    let img: string | undefined;
    let doc: string | undefined;

    if (image) {
      img = `/uploads/documents/brosur/img/${image?.filename}`;
      updateData.image = img;

      if (document.image) {
        const fileName = basename(document.image);
        const oldPath = join(uploadRoot, 'img', fileName);
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      }
    }

    if (file) {
      doc = `/uploads/documents/brosur/file/${file?.filename}`;
      updateData.file = doc;

      if (document.file) {
        const fileName = basename(document.file);
        const oldPath = join(uploadRoot, 'file', fileName);
        if (existsSync(oldPath)) {
          unlinkSync(oldPath);
        }
      }
    }

    return await this.prisma.document.update({
      where: {
        id,
      },
      data: updateData,
    });
  }

  async remove(id: string) {
    const documentExisting = await this.findOne(id);
    if (!documentExisting) {
      throw new BadRequestException('Document not found');
    }

    const uploadRoot = join(process.cwd(), 'uploads', 'documents', 'brosur');
    if (documentExisting.image) {
      const fileName = basename(documentExisting.image);
      const oldPath = join(uploadRoot, 'img', fileName);
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    if (documentExisting.file) {
      const fileName = basename(documentExisting.file);
      const oldPath = join(uploadRoot, 'file', fileName);
      if (existsSync(oldPath)) {
        unlinkSync(oldPath);
      }
    }

    return await this.prisma.document.delete({
      where: {
        id,
      },
    });
  }
}
