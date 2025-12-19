import { CreateGallerySchema } from './create-gallery.dto';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateGallerySchema = CreateGallerySchema.partial();

export class UpdateGalleryDto extends createZodDto(UpdateGallerySchema) {}
