import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { CreateAppointmentDto } from 'src/modules/appointment/dto/create-appointment.dto';
import { Appointment, AppointmentDocument } from './appointment.entity';

@Injectable()
export class AppointmentRepository {
  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentRepository: Model<AppointmentDocument>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto) {
    return await this.appointmentRepository.create(createAppointmentDto);
  }

  async findOne(query: FilterQuery<Appointment>) {
    const foundAppointment = await this.appointmentRepository
      .findOne(query)
      .exec();
    if (!foundAppointment)
      throw new NotFoundException('Appointment not found!');
    return foundAppointment;
  }

  async find(filterQuery?: FilterQuery<Appointment>, limit = 10, offset = 0) {
    const [data, totalCount] = await Promise.all([
      this.appointmentRepository
        .find(filterQuery)
        .limit(limit)
        .skip(offset)
        .exec(),
      this.appointmentRepository.count(filterQuery),
    ]);

    return {
      data,
      totalCount,
    };
  }
  async update(query: FilterQuery<Appointment>, update: Partial<Appointment>) {
    const updatedAppointment = await this.appointmentRepository
      .findOneAndUpdate(query, update, {
        new: true,
      })
      .exec();
    if (!updatedAppointment)
      throw new NotFoundException('Appointment not found!');
    return updatedAppointment;
  }

  async delete(query: FilterQuery<Appointment>) {
    return await this.appointmentRepository.deleteOne(query).exec();
  }
}
