import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private mailFrom: string;
  constructor(
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.mailFrom = configService.get('mail.auth.user');
  }

  async sendMail(to: string, subject: string, text: string) {
    try {
      await this.mailService.sendMail({
        to,
        from: this.mailFrom,
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
