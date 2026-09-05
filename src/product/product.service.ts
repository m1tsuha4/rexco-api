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
import fs, { existsSync, unlinkSync } from 'fs';
import { basename, join } from 'path';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
    primaryImage?: Express.Multer.File,
    images?: Express.Multer.File[],
    documents?: Express.Multer.File[],
    icon?: Express.Multer.File[],
    variantImages?: Express.Multer.File[],
  ) {
    try {
      const slug = slugify(createProductDto.name, {
        lower: true,
        strict: true,
      });
      if (await this.prisma.product.findUnique({ where: { slug } })) {
        throw new BadRequestException('Product slug already exists');
      }

      return await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            name: createProductDto.name,
            slug,
            description: createProductDto.description,
            primaryImage: primaryImage
              ? `/uploads/product/primary-image/${primaryImage.filename}`
              : null,
            urlYoutube: createProductDto.urlYoutube,
            color: createProductDto.color,
          },
        });

        if (createProductDto.productVideos?.length) {
          await tx.productVideo.createMany({
            data: createProductDto.productVideos.map((video, index) => ({
              productId: product.id,
              url: video.url,
              title: video.title ?? null,
              order: video.order ?? index + 1,
            })),
          });
        }

        if (createProductDto.productFeature?.length) {
          await tx.productFeature.createMany({
            data: createProductDto.productFeature.map((feature, index) => ({
              icon:
                icon && icon[index]
                  ? `/uploads/product/icons/${icon[index].filename}`
                  : null,
              text: feature.text,
              order: feature.order,
              productId: product.id,
            })),
          });
        }

        if (images && images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((image) => ({
              productId: product.id,
              url: `/uploads/product/images/${image.filename}`,
            })),
          });
        }

        if (createProductDto.productStore?.length) {
          for (let i = 0; i < createProductDto.productStore.length; i++) {
            const pStore = createProductDto.productStore[i];
            const variantFile =
            variantImages?.find((file) =>
              file.originalname.startsWith(`variant_${i}_`)
            ) ?? (variantImages?.length === createProductDto.productStore.length ? variantImages[i] : undefined);
            const productStore = await tx.productStore.create({
              data: {
                name: pStore.name,
                productId: product.id,
                imageUrl: variantFile
                  ? `/uploads/product/variants/${variantFile.filename}`
                  : pStore.imageUrl ?? null,
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
              file: `/uploads/product/documents/${document.filename}`,
              type: createProductDto.productDocument?.[index]?.type,
            })),
          });
        }

        return await tx.product.findUnique({
          where: { id: product.id },
          include: {
            productVideos: { orderBy: { order: 'asc' } },
            productImage: true,
            productStore: {
              include: {
                productStore: true,
              },
            },
            productDocument: true,
            productFeature: { orderBy: { order: 'asc' } },
          },
        });
      });
    } catch (error) {
      [
        ...(images ?? []),
        ...(documents ?? []),
        ...(variantImages ?? []),
        ...(icon ?? []),
        ...(primaryImage ? [primaryImage] : []),
      ].forEach((file) => {
        if (file?.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll() {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        primaryImage: true,
        slug: true,
        color: true,
        description: true,
        urlYoutube: true,
        productVideos: {
          select: {
            id: true,
            url: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        productImage: {
          select: {
            url: true,
          },
        },
        productStore: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
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
        color: true,
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
        color: true,
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
        primaryImage: true,
        slug: true,
        description: true,
        urlYoutube: true,
        color: true,
        productVideos: {
          select: {
            id: true,
            url: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        productImage: {
          select: {
            url: true,
          },
        },
        productFeature: {
          select: {
            text: true,
            order: true,
            icon: true,
          },
        },
        productStore: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
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

  async bestSeller() {
    return await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        primaryImage: true,
        slug: true,
        color: true,
        productFeature: {
          select: {
            text: true,
            order: true,
            icon: true,
          },
        },
        productImage: {
          select: {
            url: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBySlug(slug: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        slug,
       }
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
        productVideos: {
          select: {
            id: true,
            url: true,
            title: true,
            order: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        productImage: {
          select: {
            url: true,
          },
        },
        productFeature: {
          select: {
            text: true,
            order: true,
            icon: true,
          },
        },
        productStore: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
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
    primaryImage?: Express.Multer.File,
    images?: Express.Multer.File[],
    documents?: Express.Multer.File[],
    icon?: Express.Multer.File[],
    variantImages?: Express.Multer.File[],
  ) {
    const existingProduct = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        productFeature: true,
        productStore: true,
        productDocument: true,
        productImage: true,
        productVideos: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const slug = updateProductDto.name
      ? slugify(updateProductDto.name, { lower: true, strict: true })
      : existingProduct.slug;
    if (slug !== existingProduct.slug) {
      const slugExist = await this.prisma.product.findUnique({
        where: { slug },
      });
      if (slugExist) {
        throw new BadRequestException(
          'Product with the same slug already exists',
        );
      }
    }

    const oldImagePaths = join(process.cwd(), 'uploads', 'product', 'images');
    const oldDocumentPaths = join(
      process.cwd(), 
      'uploads', 
      'product', 
      'documents',
    );
    const oldIconPaths = join(process.cwd(), 'uploads', 'product', 'icons');
    const oldPrimaryImagePaths = join(
      process.cwd(), 
      'uploads', 
      'product', 
      'primary-image',
    );
    const oldVariantPaths = join(process.cwd(), 'uploads', 'product', 'variants');

    try {
      const updatedProduct = await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            name: updateProductDto.name,
            slug,
            description: updateProductDto.description,
            primaryImage: primaryImage
              ? `/uploads/product/primary-image/${primaryImage.filename}`
              : undefined,
            urlYoutube: updateProductDto.urlYoutube,
            color: updateProductDto.color,
          },
        });

        if (primaryImage && existingProduct.primaryImage) {
          const fileName = basename(existingProduct.primaryImage);
          const oldPath = join(oldPrimaryImagePaths, fileName);
          if (existsSync(oldPath)) unlinkSync(oldPath);
        }

        if (updateProductDto.productVideos) {
          await tx.productVideo.deleteMany({ where: { productId: id } });
          if (updateProductDto.productVideos.length > 0) {
            await tx.productVideo.createMany({
              data: updateProductDto.productVideos.map((video, index) => ({
                productId: id,
                url: video.url,
                title: video.title ?? null,
                order: video.order ?? index + 1,
              })),
            });
          }
        }

        if (images?.length) {
          for (const img of existingProduct.productImage) {
            const fileName = basename(img.url);
            const oldPath = join(oldImagePaths, fileName);
            if (existsSync(oldPath)) {
              unlinkSync(oldPath);
            }
          }

          await tx.productImage.deleteMany({ 
            where: { 
              productId: id,
             },
            });

          await tx.productImage.createMany({
            data: images.map((image) => ({
              productId: id,
              url: `/uploads/product/images/${image.filename}`,
            })),
          });
        }

        if (documents?.length) {
          for (const doc of existingProduct.productDocument) {
            const fileName = basename(doc.file);
            const oldPath = join(oldDocumentPaths, fileName);
            if (existsSync(oldPath)) {
              unlinkSync(oldPath);
            }
          }

          await tx.productDocument.deleteMany({
            where: {
              productId: id,
            },
          });
          
          await tx.productDocument.createMany({
            data: documents.map((document, index) => ({
              productId: id,
              file: `/uploads/product/documents/${document.filename}`,
              type: updateProductDto.productDocument?.[index]?.type,
            })),
          });
        }

        if (updateProductDto.productStore) {
          const keptImageUrls = updateProductDto.productStore
            .map((ps) => ps.imageUrl)
            .filter(Boolean) as string[];
          for (const oldStore of existingProduct.productStore) {
            if (
              oldStore.imageUrl &&
              !keptImageUrls.some((kept) => kept.includes(basename(oldStore.imageUrl!)))
            ) {
              const fileName = basename(oldStore.imageUrl);
              const oldPath = join(oldVariantPaths, fileName);
              if (existsSync(oldPath)) unlinkSync(oldPath);
            }
          }
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

          for (let i = 0; i < updateProductDto.productStore.length; i++) {
          const pStore = updateProductDto.productStore[i];
          const variantFile =
            variantImages?.find((file) =>
              file.originalname.startsWith(`variant_${i}_`)
            ) ?? (variantImages?.length === updateProductDto.productStore.length ? variantImages[i] : undefined);

          const finalImageUrl = variantFile
            ? `/uploads/product/variants/${variantFile.filename}`
            : pStore.imageUrl ?? null;

          const productStore = await tx.productStore.create({
            data: {
              name: pStore.name,
              productId: id,
              imageUrl: finalImageUrl,
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

        if (updateProductDto.productFeature) {
          for (const feat of existingProduct.productFeature) {
            if (feat.icon) {
              const fileName = basename(feat.icon);
              const oldPath = join(oldIconPaths, fileName);
              if (existsSync(oldPath)) {
                unlinkSync(oldPath);
              }
            }
          }

          await tx.productFeature.deleteMany({
            where: {
              productId: id,
            },
          });

          await tx.productFeature.createMany({
            data: updateProductDto.productFeature.map((feature, index) => ({
              productId: id,
              text: feature.text,
              order: feature.order,
              icon:
                icon && icon[index]
                  ? `/uploads/product/icons/${icon[index].filename}`
                  : null,
            })),
          });
        }
        return await tx.product.findUnique({
          where: { id },
          include: {
            productVideos: { orderBy: { order: 'asc' } },
            productImage: true,
            productStore: {
              include: {
                productStore: true,
              },
            },
            productDocument: true,
            productFeature: { orderBy: { order: 'asc' } },
          },
        });
      });

      return updatedProduct;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
      include: {
        productFeature: true,
        productStore: true,
        productImage: true,
        productDocument: true,
        productVideos: true,
      },
    });

    if (!existingProduct) {
      throw new NotFoundException('Product not found');
    }

    const uploadRoot = join(process.cwd(), 'uploads', 'product');

    await this.prisma.$transaction(async (tx) => {
      for (const img of existingProduct.productImage) {
        const fileName = basename(img.url);
        const oldPath = join(uploadRoot, 'images', fileName);
        if (existsSync(oldPath)) unlinkSync(oldPath);
      }
      for (const store of existingProduct.productStore) {
        if (store.imageUrl) {
          const fileName = basename(store.imageUrl);
          const oldPath = join(uploadRoot, 'variants', fileName);
          if (existsSync(oldPath)) unlinkSync(oldPath);
        }
      }

      for (const doc of existingProduct.productDocument) {
        const fileName = basename(doc.file);
        const oldPath = join(uploadRoot, 'documents', fileName);
        if (existsSync(oldPath)) unlinkSync(oldPath);
      }
      for (const feat of existingProduct.productFeature) {
        if (feat.icon) {
          const fileName = basename(feat.icon);
          const oldPath = join(uploadRoot, 'icons', fileName);
          if (existsSync(oldPath)) unlinkSync(oldPath);
        }
      }
      await tx.productVideo.deleteMany({ where: { productId: id } });
      await tx.productFeature.deleteMany({ where: { productId: id } });
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productDocument.deleteMany({ where: { productId: id } });
      await tx.store.deleteMany({ where: { productStore: { productId: id } } });
      await tx.productStore.deleteMany({ where: { productId: id } });
      await tx.product.delete({where: { id } });
    });

    return true;
  }
}
