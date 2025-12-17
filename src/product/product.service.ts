import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import slugify from 'slugify';
import fs from 'fs';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
    images?: Express.Multer.File[],
    documents?: Express.Multer.File[],
  ) {
    try {
      const slug = slugify(createProductDto.name, {
        lower: true,
        strict: true,
      });
      if (await this.prisma.product.findUnique({ where: { slug } })) {
        throw new BadRequestException('Product slug already exists');
      }

      return this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: createProductDto.name,
            slug,
            description: createProductDto.description,
            urlYoutube: createProductDto.urlYoutube,
          },
        });

        if (images && images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image) => ({
              productId: product.id,
              url: `/uploads/product/${image.filename}`,
            })),
          });
        }

        if (createProductDto.productStore?.length) {
          for (const pStore of createProductDto.productStore) {
            const productStore = await tx.productStore.create({
              data: {
                name: pStore.name,
                productId: product.id,
              },
            });

            if (pStore.stores?.length) {
              await tx.store.createMany({
                data: pStore.stores.map((store) => ({
                  name: store.name,
                  urlStore: store.urlStore,
                  productStoreId: productStore.id,
                })),
              });
            }
          }
        }

        if (documents && documents.length > 0) {
          await tx.productDocument.createMany({
            data: documents.map((document, index) => ({
              productId: product.id,
              file: `/uploads/product/document/${document.filename}`,
              type: createProductDto.productDocument?.[index].type,
            })),
          });
        }

        return product;
      });
    } catch (error) {
      [...(images ?? []), ...(documents ?? [])].forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll() {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        urlYoutube: true,
        productImage: {
          select: {
            url: true,
          },
        },
        productStore: {
          select: {
            name: true,
            productStore: {
              select: {
                name: true,
                urlStore: true,
              },
            },
          },
        },
        productDocument: {
          select: {
            type: true,
            file: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findAllNavbar() {
    const product = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return product.map((p) => ({
      id: p.id,
      name: p.name.split(/[-–]/)[0].trim(),
    }));
  }

  async findAllProduct() {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        productImage: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  async search(search: string) {
    return await this.prisma.product.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        productImage: {
          select: {
            url: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    return await this.prisma.product.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        urlYoutube: true,
        productImage: {
          select: {
            url: true,
          },
        },
        productStore: {
          select: {
            name: true,
            productStore: {
              select: {
                name: true,
                urlStore: true,
              },
            },
          },
        },
        productDocument: {
          select: {
            type: true,
            file: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        slug,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    return await this.prisma.product.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        urlYoutube: true,
        productImage: {
          select: {
            url: true,
          },
        },
        productStore: {
          select: {
            name: true,
            productStore: {
              select: {
                name: true,
                urlStore: true,
              },
            },
          },
        },
        productDocument: {
          select: {
            type: true,
            file: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    images?: Express.Multer.File[],
    documents?: Express.Multer.File[],
  ) {
    console.log(updateProductDto);
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        productDocument: true,
        productImage: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const oldImagePaths = existingProduct.productImage.map(
      (image) => `.${image.url}`,
    );
    const oldDocumentPaths = existingProduct.productDocument.map(
      (document) => `.${document.file}`,
    );

    try {
      const updatedProduct = await this.prisma.$transaction(async (tx) => {
        const data: any = {};

        if (typeof updateProductDto.name === 'string') {
          data.name = updateProductDto.name;
          data.slug = slugify(updateProductDto.name, {
            lower: true,
            strict: true,
          });
        }

        if (typeof updateProductDto.description === 'string') {
          data.description = updateProductDto.description;
        }

        if (typeof updateProductDto.urlYoutube === 'string') {
          data.urlYoutube = updateProductDto.urlYoutube;
        }

        if (Object.keys(data).length === 0) {
          throw new BadRequestException('No fields to update');
        }

        const product = await tx.product.update({
          where: { id },
          data,
        });

        if (images?.length) {
          await tx.productImage.deleteMany({
            where: {
              productId: id,
            },
          });

          await tx.productImage.createMany({
            data: images.map((image) => ({
              productId: id,
              url: `/uploads/product/${image.filename}`,
            })),
          });

          existingProduct.productImage.forEach((image) => {
            if (fs.existsSync(image.url)) {
              fs.unlinkSync(image.url);
            }
          });
        }

        if (documents?.length) {
          await tx.productDocument.deleteMany({
            where: {
              productId: id,
            },
          });

          await tx.productDocument.createMany({
            data: documents.map((document) => ({
              productId: id,
              file: `/uploads/product/document/${document.filename}`,
              type: updateProductDto.productDocument?.[
                documents.indexOf(document)
              ].type,
            })),
          });

          existingProduct.productDocument.forEach((document) => {
            if (fs.existsSync(document.file)) {
              fs.unlinkSync(document.file);
            }
          });
        }

        if (updateProductDto.productStore) {
          await tx.store.deleteMany({
            where: {
              productStore: {
                productId: id,
              },
            },
          });

          await tx.productStore.deleteMany({
            where: {
              productId: id,
            },
          });

          for (const pStore of updateProductDto.productStore) {
            const productStore = await tx.productStore.create({
              data: {
                name: pStore.name,
                productId: id,
              },
            });

            if (pStore.stores?.length) {
              await tx.store.createMany({
                data: pStore.stores.map((store) => ({
                  name: store.name,
                  urlStore: store.urlStore,
                  productStoreId: productStore.id,
                })),
              });
            }
          }
        }
        return product;
      });

      if (images?.length) {
        oldImagePaths.forEach((path) => {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        });
      }

      if (documents?.length) {
        oldDocumentPaths.forEach((path) => {
          if (fs.existsSync(path)) {
            fs.unlinkSync(path);
          }
        });
      }

      return updatedProduct;
    } catch (error) {
      [...(images ?? []), ...(documents ?? [])].forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      throw error;
    }
  }

  async remove(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        productImage: true,
        productDocument: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const imagePath = existingProduct.productImage.map(
      (image) => `.${image.url}`,
    );
    const documentPath = existingProduct.productDocument.map(
      (document) => `.${document.file}`,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.product.delete({
        where: {
          id,
        },
      });

      await tx.productImage.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.productDocument.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.productStore.deleteMany({
        where: {
          productId: id,
        },
      });

      await tx.store.deleteMany({
        where: {
          productStore: {
            productId: id,
          },
        },
      });
    });

    [...imagePath, ...documentPath].forEach((path) => {
      if (fs.existsSync(path)) {
        fs.unlinkSync(path);
      }
    });

    return true;
  }
}
