import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.mailService.sendMail({
        to,
        from: 'hospitalmanagementmailer@gmail.com',
        subject,
        text,
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
