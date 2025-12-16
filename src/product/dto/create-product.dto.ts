import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  urlYoutube: z.string().url({ message: 'Invalid URL' }).optional(),

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
