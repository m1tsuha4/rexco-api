import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const SendEmailZod = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    subject: z.string().min(1),
    message: z.string().min(1),
});

export class SendEmailDto extends createZodDto(SendEmailZod) { }
