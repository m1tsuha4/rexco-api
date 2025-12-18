import { createZodDto } from '@anatine/zod-nestjs';
import z from 'zod';

export const CreateDocumentSchema = z.object({
  title: z.string(),
});

export class CreateDocumentDto extends createZodDto(CreateDocumentSchema) {}
