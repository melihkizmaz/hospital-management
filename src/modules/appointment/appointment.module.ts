import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { MailModule } from 'src/mail/mail.module';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

@Module({
  imports: [DatabaseModule, MailModule],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
