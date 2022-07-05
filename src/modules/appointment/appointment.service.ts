import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as moment from 'moment';
import { Types } from 'mongoose';
import { AppointmentRepository } from 'src/database/appointment/entity/appointment.repository';
import { DoctorRepository } from 'src/database/doctor/entity/doctor.repository';
import { MailService } from 'src/mail/mail.service';
import { ICurrentUser } from '../auth/dto/current-user.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly doctorRepository: DoctorRepository,
    private readonly mailService: MailService,
  ) {}

  async createAppointment(
    user: ICurrentUser,
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
        'Doctor is not working at this policlinic on this date',
      );

    const hasAppointment = await this.appointmentRepository.findOne({
      policlinic: new Types.ObjectId(createAppointmentDto.policlinic),
      user: user._id,
      isCanceled: false,
      startDate: { $gte: moment().toDate() },
    });

    if (
      hasAppointment &&
      moment(hasAppointment.startDate).format('YYYY-MM-DD') ===
        moment(date.toDate()).format('YYYY-MM-DD')
    )
      throw new ConflictException(
        'You already have an appointment at this clinic on this date',
      );

    const myAppointments = await this.appointmentRepository.find({
      user: user._id,
      isCanceled: false,
      startDate: { $gte: moment().toDate() },
    });

    const checkConflictAppointmentsDate = myAppointments.data.some(
      (appointment) => {
        const existDate = moment(appointment.startDate);
        const newDate = moment(createAppointmentDto.startDate);

        return (
          existDate.hour() === newDate.hour() &&
          existDate.minute() === newDate.minute() &&
          existDate.format('YYYY-MM-DD') === newDate.format('YYYY-MM-DD')
        );
      },
    );
    if (checkConflictAppointmentsDate)
      throw new ConflictException(
        'You can just take one appointment at the same time',
      );

    const doctorAppointments = await this.appointmentRepository.find({
      doctor: new Types.ObjectId(doctor._id),
      isCanceled: false,
      startDate: { $gte: moment().toDate() },
    });

    const hasDoctorAppointments = doctorAppointments.data.some(
      (appointment) => {
        const existDate = moment(appointment.startDate);
        const newDate = moment(createAppointmentDto.startDate);

        return (
          existDate.format('YYYY-MM-DD') === newDate.format('YYYY-MM-DD') &&
          existDate.hour() === newDate.hour() &&
          existDate.minute() === newDate.minute()
        );
      },
    );
    if (hasDoctorAppointments)
      throw new ConflictException('Doctor has an appointment in this date');

    const createdAppointment = await this.appointmentRepository.create({
      doctor: new Types.ObjectId(createAppointmentDto.doctor),
      policlinic: new Types.ObjectId(createAppointmentDto.policlinic),
      user: user._id,
      startDate: date.toDate(),
    });

    this.mailService.sendMail(
      user.email,
      'Appointment Status',
      'Your appointment has been created',
    );

    return createdAppointment;
  }
  async cancelAppointment(appointmentId: Types.ObjectId, user: ICurrentUser) {
    const appointment = await this.appointmentRepository.findOne({
      _id: appointmentId,
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.user.toString() !== user._id.toString())
      throw new NotFoundException('You are not the owner of this appointment');

    if (moment(appointment.startDate).subtract(1, 'hour').isBefore(moment()))
      throw new ConflictException(
        'Past appointments cannot be canceled and you cannot cancel an appointment if there is less than an hour before the appointment time.',
      );

    if (appointment.isCanceled)
      throw new ConflictException('Appointment is already canceled');

    const canceledAppointment = await this.appointmentRepository.update(
      { _id: appointmentId },
      { isCanceled: true },
    );

    this.mailService.sendMail(
      user.email,
      'Appointment Status',
      'Your appointment has been canceled',
    );

    return canceledAppointment;
  }

  async findOneWithAuth(appointmentId: Types.ObjectId, userId: Types.ObjectId) {
    const appointment = await this.appointmentRepository.findOne({
      _id: appointmentId,
    });

    if (!appointment) throw new NotFoundException('Appointment not found');

    if (appointment.user._id.toHexString() !== userId.toHexString())
      throw new NotFoundException('You are not the owner of this appointment');

    return appointment;
  }
}
