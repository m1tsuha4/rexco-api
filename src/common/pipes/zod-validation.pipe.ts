import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    if (value === undefined || value === null) {
      value = {};
    }

    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed',
        errors: result.error.format(),
      });
    }

    return result.data;
  }
}
