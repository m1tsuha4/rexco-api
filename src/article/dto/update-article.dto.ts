import { createZodDto } from '@anatine/zod-nestjs';
import { CreateArticleSchema } from './create-article.dto';

export const UpdateArticleSchema = CreateArticleSchema.partial();

export class UpdateArticleDto extends createZodDto(UpdateArticleSchema) {}
