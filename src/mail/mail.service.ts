import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: this.configService.get<string>('SMTP_USER'), // Often gmail overrides this to the auth user anyway
                to,
                subject,
                html,
            });
            return { message: 'Email sent successfully' };
        } catch (error) {
            console.error('Error sending email:', error);
            throw new InternalServerErrorException('Failed to send email');
        }
    }

    async sendEmail(dto: SendEmailDto) {
        const html = `
      <p><strong>Name:</strong> ${dto.name}</p>
      <p><strong>Email:</strong> ${dto.email}</p>
      <p><strong>Phone:</strong> ${dto.phone}</p>
      <p><strong>Message:</strong></p>
      <p>${dto.message}</p>
    `;
        return this.sendMail('rexco.indonesia@gmail.com', dto.subject, html);
    }
}
