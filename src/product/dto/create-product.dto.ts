import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  primaryImage: z.string().optional(),
  urlYoutube: z.string().url({ message: 'Invalid URL' }).optional(),
  color: z.string().optional(),

  productVideos: z
    .array(
      z.object({
        url: z.string().url({ message: 'Invalid YouTube URL' }),
        title: z.string().optional(),
        order: z.number().default(0),
      }),
    )
    .optional(),

  productFeature: z
    .array(
      z.object({
        icon: z.string().optional(),
        text: z.string(),
        order: z.number(),
      }),
    )
    .optional(),

  productImage: z
    .array(
      z.object({
        url: z.string(),
      }),
    )
    .optional(),

  productStore: z
    .array(
      z.object({
        name: z.string(),
        imageUrl: z.string().optional(),
        stores: z
          .array(
            z.object({
              name: z.string(),
              urlStore: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),

  productDocument: z
    .array(
      z.object({
        type: z.enum(['MSDS', 'TDS']),
      }),
    )
    .optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
