import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { DoctorRepository } from 'src/database/doctor/entity/doctor.repository';
import * as moment from 'moment';
import { Doctor } from 'src/database/doctor/entity/doctor.entity';

@Injectable()
export class DoctorScheduleService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async createPoliclinicSchedule(
    id: string,
    date: Date,
    policlinicId: string,
  ): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ _id: id });
    if (!doctor) throw new NotFoundException('Doctor not found!');

    const formattedDate = moment(date).toDate();

    const isAvailable = await this.isDoctorAvailable(formattedDate, doctor._id);
    if (!isAvailable) throw new NotFoundException('Doctor is not available!');

    doctor.policlinicSchedule.push({
      date,
      policlinic: new Types.ObjectId(policlinicId),
    });
    return this.doctorRepository.update({ _id: doctor._id }, doctor);
  }

  async isDoctorAvailable(
    date: Date,
    doctorId: Types.ObjectId,
  ): Promise<boolean> {
    const doctor = await this.doctorRepository.findOne({ _id: doctorId });

    return !doctor.policlinicSchedule.some((value) => {
      return moment(value.date).isSame(date, 'day');
    });
  }
}
