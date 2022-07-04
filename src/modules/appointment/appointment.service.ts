import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as moment from 'moment';
import { Types } from 'mongoose';
import { AppointmentRepository } from 'src/database/appointment/entity/appointment.repository';
import { DoctorRepository } from 'src/database/doctor/entity/doctor.repository';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async createAppointment(
    userId: Types.ObjectId,
    createAppointmentDto: CreateAppointmentDto,
  ) {
    const date = moment(createAppointmentDto.startDate);
    const hour = date.hours();
    const weekDay = date.isoWeekday();

    if (date.isBefore(moment()))
      throw new NotFoundException('Past date is not allowed');

    if (hour < 9 || hour === 12 || hour >= 17 || weekDay === 6 || weekDay === 7)
      throw new NotFoundException('Out of working hours');

    if (date.minute() !== 0 && date.minute() !== 30)
      throw new NotFoundException('Only full and half hours are allowed');

    const doctor = await this.doctorRepository.findOne({
      _id: new Types.ObjectId(createAppointmentDto.doctor),
    });

    if (!doctor) throw new NotFoundException('Doctor not found');

    if (
      !doctor.policlinicSchedule.some((schedule) => {
        return (
          moment(schedule.date).format('YYYY-MM-DD') ===
            moment(date.toDate()).format('YYYY-MM-DD') &&
          schedule.policlinic.toHexString() === createAppointmentDto.policlinic
        );
      })
    )
      throw new NotFoundException(
        'Doctor does not work in this date or this policlinic',
      );

    const hasAppointment = await this.appointmentRepository.findOne({
      policlinic: new Types.ObjectId(createAppointmentDto.policlinic),
      user: userId,
      isCanceled: false,
      startDate: { $gte: moment().toDate() },
    });

    if (
      hasAppointment &&
      moment(hasAppointment.startDate).format('YYYY-MM-DD') ===
        moment(date.toDate()).format('YYYY-MM-DD')
    )
      throw new ConflictException(
        'You already have an appointment in date and policlinic',
      );

    const myAppointments = await this.appointmentRepository.find({
      user: userId,
      isCanceled: false,
      startDate: { $gte: moment().toDate() },
    });

    const checkConflictAppointmentsDate = myAppointments.data.some(
      (appointment) => {
        const alreadyHaveDate = moment(appointment.startDate);
        const newDate = moment(createAppointmentDto.startDate);

        return (
          alreadyHaveDate.hour() === newDate.hour() &&
          alreadyHaveDate.minute() === newDate.minute() &&
          alreadyHaveDate.format('YYYY-MM-DD') === newDate.format('YYYY-MM-DD')
        );
      },
    );
    if (checkConflictAppointmentsDate)
      throw new ConflictException(
        'You can just take one appointment same time',
      );

    const appointmentsDoc = await this.appointmentRepository.find({
      doctor: new Types.ObjectId(doctor._id),
      isCanceled: false,
      startDate: { $gte: moment().toDate() },
    });

    const hasAppointmentDoc = appointmentsDoc.data.some((appointment) => {
      const alreadyHaveDate = moment(appointment.startDate);
      const newDate = moment(createAppointmentDto.startDate);

      return (
        alreadyHaveDate.format('YYYY-MM-DD') === newDate.format('YYYY-MM-DD') &&
        alreadyHaveDate.hour() === newDate.hour() &&
        alreadyHaveDate.minute() === newDate.minute()
      );
    });
    if (hasAppointmentDoc)
      throw new ConflictException('Doctor has an appointment in this date');

    return await this.appointmentRepository.create({
      doctor: new Types.ObjectId(createAppointmentDto.doctor),
      policlinic: new Types.ObjectId(createAppointmentDto.policlinic),
      user: userId,
      startDate: date.toDate(),
    });
  }
  async cancelAppointment(
    appointmentId: Types.ObjectId,
    userId: Types.ObjectId,
  ) {
    const appointment = await this.appointmentRepository.findOne({
      _id: appointmentId,
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.user.toHexString() !== userId.toHexString())
      throw new NotFoundException('You are not the owner of this appointment');

    if (appointment.isCanceled)
      throw new ConflictException('Appointment is already canceled');

    return await this.appointmentRepository.update(
      { _id: appointmentId },
      { isCanceled: true },
    );
  }
}
