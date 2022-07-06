import { Test, TestingModule } from '@nestjs/testing';
import * as moment from 'moment';
import { DoctorRepository } from '../../../database/doctor/entity/doctor.repository';
import { AppointmentRepository } from '../../../database/appointment/entity/appointment.repository';
import { AppointmentService } from '../appointment.service';
import { appointmentRepositoryMock } from './mocks/appointment-repository.mock';
import { doctorRepositoryMock } from './mocks/doctor-repository.mock';
import { mailServiceMock } from './mocks/mail-service.mock';
import { MailService } from '../../..//mail/mail.service';
import { ICurrentUser } from '../../../modules/auth/dto/current-user.interface';
import { User } from '../../../database/user/user.entity/user.entity';
import { Types } from 'mongoose';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { Doctor } from '../../../database/doctor/entity/doctor.entity';
import { Appointment } from '../../../database/appointment/entity/appointment.entity';

describe('AppointmentService', () => {
  let module: TestingModule;
  let appointmentService: AppointmentService;
  let mockAppointmentRepository: jest.Mocked<AppointmentRepository>;
  let mockDoctorRepository: jest.Mocked<DoctorRepository>;
  let mockMailerService: jest.Mocked<MailService>;
  let createAppointment: CreateAppointmentDto;
  let cancelAppointment: any;
  let CURRENT_USER: ICurrentUser;
  let DOCTOR: any;
  let APPOINTMENT: any;
  let MYAPPOINTMENTS: any;
  let EMPTYAPPOINTMENTS: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: AppointmentRepository,
          useValue: appointmentRepositoryMock,
        },
        {
          provide: DoctorRepository,
          useValue: doctorRepositoryMock,
        },
        {
          provide: AppointmentRepository,
          useValue: appointmentRepositoryMock,
        },
        {
          provide: MailService,
          useValue: mailServiceMock,
        },
      ],
    }).compile();

    appointmentService = module.get<AppointmentService>(AppointmentService);
    mockAppointmentRepository = module.get(AppointmentRepository);
    mockDoctorRepository = module.get(DoctorRepository);
    mockMailerService = module.get(MailService);

    createAppointment = {
      doctor: '15c4829030d3e530dd779e15',
      policlinic: '62c4829930d3e530dd779e72',
      startDate: '2023-03-10T09:00',
    };
    cancelAppointment = {
      _id: '62c4829930d3e530dd779e72',
    };

    CURRENT_USER = new User();
    CURRENT_USER._id = new Types.ObjectId('62c4829030d3e530dd779e70');
    CURRENT_USER.fullName = 'John Doe';
    CURRENT_USER.email = 'john@mail.com';

    DOCTOR = new Doctor();
    DOCTOR._id = '15c4829030d3e530dd779e15';
    DOCTOR.fullName = 'John Doe';
    DOCTOR.policlinicSchedule = [
      {
        _id: new Types.ObjectId('75c4829030d3e530dd779e75'),
        date: '2023-03-09T09:00',
        policlinic: new Types.ObjectId('88c4829930d3e530dd779e88'),
      },
      {
        _id: new Types.ObjectId('62c4829030d3e530dd779e80'),
        date: '2023-03-10T09:00',
        policlinic: new Types.ObjectId('62c4829930d3e530dd779e72'),
      },
    ];

    APPOINTMENT = new Appointment();
    APPOINTMENT._id = new Types.ObjectId('01c4829030d3e530dd779e01');
    APPOINTMENT.user = new Types.ObjectId('62c4829030d3e530dd779e70');
    APPOINTMENT.doctor = new Types.ObjectId('15c4829030d3e530dd779e15');
    APPOINTMENT.policlinic = new Types.ObjectId('62c4829930d3e530dd779e72');
    APPOINTMENT.isCanceled = false;
    APPOINTMENT.startDate = '2023-03-10T09:00';

    EMPTYAPPOINTMENTS = { data: [], totalCount: 0 };
    MYAPPOINTMENTS = { data: [APPOINTMENT], totalCount: 1 };

    mockDoctorRepository.findOne.mockReturnValue(DOCTOR);
    mockAppointmentRepository.findOne.mockReturnValue(null);
  });

  afterEach(async () => {
    await module.close();
  });

  test('services should be defined', () => {
    expect(appointmentService).toBeDefined();
    expect(mockAppointmentRepository).toBeDefined();
    expect(mockDoctorRepository).toBeDefined();
    expect(mockMailerService).toBeDefined();
  });

  describe('Create appointment', () => {
    it('should throw "Past date is not allowed" error message when appointment time passed', async () => {
      let errorMessage: string;
      try {
        createAppointment.startDate = '2021-03-06T14:00';
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Past date is not allowed');
    });

    it('should throw "Out of working hours" error message when date is weekend', async () => {
      let errorMessage: string;
      try {
        createAppointment.startDate = '2023-03-11T09:00';
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Out of working hours');
    });

    it('should throw "Out of working hours" error message when time is out of working', async () => {
      let errorMessage: string;
      try {
        createAppointment.startDate = '2023-03-11T08:00';
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Out of working hours');
    });

    it('should throw "Only full and half hours are allowed" error message when time hour not full or half', async () => {
      let errorMessage: string;
      try {
        createAppointment.startDate = '2023-03-10T09:35';
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Only full and half hours are allowed');
    });

    it('should throw "Doctor not found" error message when send not existing doctor id', async () => {
      let errorMessage: string;
      try {
        mockDoctorRepository.findOne.mockReturnValue(null);
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
        expect(errorMessage).toBe('Doctor not found');
      }
    });

    it('should throw "Doctor is not working at this policlinic on this date" error message when is a date that is not on the doctors policlinic schedule', async () => {
      let errorMessage: string;
      try {
        createAppointment.startDate = '2023-03-09T09:00';
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe(
        'Doctor is not working at this policlinic on this date',
      );
    });

    it('should throw "Doctor is not working at this policlinic on this date" error message when is a date that is not on the doctors policlinic schedule', async () => {
      let errorMessage: string;
      try {
        createAppointment.policlinic = '88c4829930d3e530dd779e88';
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe(
        'Doctor is not working at this policlinic on this date',
      );
    });

    it('should throw "You already have an appointment at this clinic on this date" error message when you have appointment same day and same policlinic', async () => {
      let errorMessage: string;
      try {
        mockAppointmentRepository.findOne.mockReturnValue(APPOINTMENT);
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe(
        'You already have an appointment at this clinic on this date',
      );
    });

    it('should throw "You can just take one appointment at the same time" error message when try to make an appointment same date and time with your exist appointmnets', async () => {
      let errorMessage: string;
      mockAppointmentRepository.find.mockReturnValue(MYAPPOINTMENTS);
      try {
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe(
        'You can just take one appointment at the same time',
      );
    });

    it('should throw "Doctor has an appointment in this date" error message when try to make an appointment at a time when the doctor is not available', async () => {
      let errorMessage: string;
      mockAppointmentRepository.find.mockReturnValueOnce(EMPTYAPPOINTMENTS);
      mockAppointmentRepository.find.mockReturnValueOnce(MYAPPOINTMENTS);
      try {
        await appointmentService.createAppointment(
          CURRENT_USER,
          createAppointment,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Doctor has an appointment in this date');
    });
  });

  describe('Cancel appointment', () => {
    it('should throw "Appointment not found" error message when send not existing appointment id', async () => {
      let errorMessage: string;
      try {
        mockAppointmentRepository.findOne.mockReturnValue(null);
        await appointmentService.cancelAppointment(
          cancelAppointment._id,
          CURRENT_USER,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Appointment not found');
    });

    it('should throw "You are not the owner of this appointment" error message when current user not appointment owner', async () => {
      let errorMessage: string;
      try {
        APPOINTMENT.user = new Types.ObjectId('88c4829930d3e530dd779e88');
        mockAppointmentRepository.findOne.mockReturnValue(APPOINTMENT);
        await appointmentService.cancelAppointment(
          cancelAppointment._id,
          CURRENT_USER,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('You are not the owner of this appointment');
    });

    it('should throw "Past appointments cannot be canceled and you cannot cancel an appointment if there is less than an hour before the appointment time." error message when try cancel appointment less than an hour before appointment', async () => {
      let errorMessage: string;
      try {
        APPOINTMENT.startDate = moment()
          .add(59, 'minute')
          .format('YYYY-MM-DDTHH:mm');
        mockAppointmentRepository.findOne.mockReturnValue(APPOINTMENT);
        await appointmentService.cancelAppointment(
          cancelAppointment._id,
          CURRENT_USER,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe(
        'Past appointments cannot be canceled and you cannot cancel an appointment if there is less than an hour before the appointment time.',
      );
    });

    it('should throw "Appointment is already canceled" error message when try the cancel already canceled appointment', async () => {
      let errorMessage: string;
      try {
        APPOINTMENT.isCanceled = true;
        mockAppointmentRepository.findOne.mockReturnValue(APPOINTMENT);
        await appointmentService.cancelAppointment(
          cancelAppointment._id,
          CURRENT_USER,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Appointment is already canceled');
    });
  });

  describe('Find one appointment with authentication', () => {
    it('should throw "Appointment not found" error message when send not existing appointment id', async () => {
      let errorMessage: string;
      try {
        mockAppointmentRepository.findOne.mockReturnValue(null);
        await appointmentService.findOneWithAuth(
          APPOINTMENT._id,
          CURRENT_USER._id,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Appointment not found');
    });

    it('should throw "You are not the owner of this appointment" error message when try to find appointment with id byunauthorized user', async () => {
      let errorMessage: string;
      try {
        APPOINTMENT.user = new Types.ObjectId('88c4829930d3e530dd779e88');
        mockAppointmentRepository.findOne.mockReturnValue(APPOINTMENT);
        await appointmentService.findOneWithAuth(
          APPOINTMENT._id,
          CURRENT_USER._id,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('You are not the owner of this appointment');
    });
  });
});
