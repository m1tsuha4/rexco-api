import { createZodDto } from '@anatine/zod-nestjs';
import { CreateInstagramSchema } from './create-instagram.dto';

export const UpdateInstagramSchema = CreateInstagramSchema.partial();

export class UpdateInstagramDto extends createZodDto(UpdateInstagramSchema) {}
