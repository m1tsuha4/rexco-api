import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateInstagramSchema = z.object({
  title: z.string().optional(),
  link: z.string().optional(),
});

export class CreateInstagramDto extends createZodDto(CreateInstagramSchema) {}
