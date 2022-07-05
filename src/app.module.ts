import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { MailModule } from './mail/mail.module';
import { AppointmentModule } from './modules/appointment/appointment.module';
import { AuthModule } from './modules/auth/auth.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { PoliclinicModule } from './modules/policlinic/policlinic.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [configuration], isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => config.get('database', {}),
    }),
    DatabaseModule,
    AuthModule,
    PoliclinicModule,
    DoctorModule,
    AppointmentModule,
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
