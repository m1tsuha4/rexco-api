import { CreateProductSchema } from './create-product.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateProductSchema = CreateProductSchema.partial();

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
