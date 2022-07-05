import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Appointment,
  AppointmentSchema,
} from './appointment/entity/appointment.entity';
import { AppointmentRepository } from './appointment/entity/appointment.repository';
import { Doctor, DoctorSchema } from './doctor/entity/doctor.entity';
import { DoctorRepository } from './doctor/entity/doctor.repository';
import {
  Policlinic,
  PoliclinicSchema,
} from './policlinic/entity/policlinic.entity';
import { PoliclinicRepository } from './policlinic/entity/policlinic.repository';
import { User, UserSchema } from './user/user.entity/user.entity';
import { UserRepository } from './user/user.entity/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Policlinic.name, schema: PoliclinicSchema },
      { name: Doctor.name, schema: DoctorSchema },
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [
    UserRepository,
    PoliclinicRepository,
    DoctorRepository,
    AppointmentRepository,
  ],
  exports: [
    UserRepository,
    PoliclinicRepository,
    DoctorRepository,
    AppointmentRepository,
  ],
})
export class DatabaseModule {}
