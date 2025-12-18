import { CreateDocumentSchema } from './create-document.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateDocumentSchema = CreateDocumentSchema.partial();

export class UpdateDocumentDto extends createZodDto(UpdateDocumentSchema) {}
