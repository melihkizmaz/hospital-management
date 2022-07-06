import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../../database/user/user.entity/user.entity';
import { Types } from 'mongoose';
import { DoctorScheduleService } from '../doctor-schedule.service';
import { DoctorRepository } from '../../../database/doctor/entity/doctor.repository';
import { ICreateDoctorSchedule } from './craete-doctorSchedule.interface';
import * as moment from 'moment';
import { doctorRepositoryMock } from './mocks/doctor-repository.mock';
import { PoliclinicRepository } from '../../../database/policlinic/entity/policlinic.repository';
import { policlinicRepositoryMock } from './mocks/policlinic-repository.mock';
import { Doctor } from '../../../database/doctor/entity/doctor.entity';
import { Policlinic } from '../../../database/policlinic/entity/policlinic.entity';

describe('DoctorScheduleService', () => {
  let module: TestingModule;
  let doctorScheduleService: DoctorScheduleService;
  let mockDoctorRepository: jest.Mocked<DoctorRepository>;
  let mockPoliclinicRepository: jest.Mocked<PoliclinicRepository>;
  let createDoctorSchedule: ICreateDoctorSchedule;
  let USER: any;
  let DOCTOR: any;
  let POLICLINIC: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        DoctorScheduleService,
        {
          provide: DoctorRepository,
          useValue: doctorRepositoryMock,
        },
        {
          provide: PoliclinicRepository,
          useValue: policlinicRepositoryMock,
        },
      ],
    }).compile();

    doctorScheduleService = module.get<DoctorScheduleService>(
      DoctorScheduleService,
    );
    mockDoctorRepository = module.get(DoctorRepository);
    mockPoliclinicRepository = module.get(PoliclinicRepository);

    createDoctorSchedule = {
      id: '62c4829030d3e530dd779e10',
      date: '2022-07-06T14:00',
      policlinicId: '62c4829030d3e530dd779e71',
    };

    USER = new User();
    USER._id = new Types.ObjectId('62c4829030d3e530dd779e70');
    USER.fullName = 'John Doe';
    USER.email = 'john@mail.com';
    USER.password = '123456';
    USER.valiadatePassword = jest.fn();

    DOCTOR = new Doctor();
    DOCTOR._id = '15c4829030d3e530dd779e15';
    DOCTOR.fullName = 'John Doe';
    DOCTOR.policlinicSchedule = [];

    POLICLINIC = new Policlinic();
    POLICLINIC._id = '15c4829030d3e530dd779e15';
    POLICLINIC.title = 'John Doe';

    mockDoctorRepository.findOne.mockResolvedValue(DOCTOR);
    mockPoliclinicRepository.findOne.mockResolvedValue(POLICLINIC);
  });

  afterEach(async () => {
    await module.close();
  });

  test('services should be defined', () => {
    expect(doctorScheduleService).toBeDefined();
    expect(mockDoctorRepository).toBeDefined();
    expect(mockPoliclinicRepository).toBeDefined();
  });

  describe('Create policlinic schedule', () => {
    it('should throw "Doctor not found!" error message when send not existing doctor id', async () => {
      let errorMessage;
      try {
        mockDoctorRepository.findOne.mockResolvedValue(null);
        await doctorScheduleService.createPoliclinicSchedule(
          createDoctorSchedule.id,
          moment(createDoctorSchedule.date).toDate(),
          createDoctorSchedule.policlinicId,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Doctor not found!');
    });

    it('should throw "Policlinic not found!" error message when send not existing policlinic id', async () => {
      let errorMessage;
      try {
        mockPoliclinicRepository.findOne.mockResolvedValue(null);
        await doctorScheduleService.createPoliclinicSchedule(
          createDoctorSchedule.id,
          moment(createDoctorSchedule.date).toDate(),
          createDoctorSchedule.policlinicId,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Policlinic not found!');
    });

    it('should throw "Doctor is not available!" error message when tries to add a day when the doctor not available', async () => {
      let errorMessage;
      try {
        DOCTOR.policlinicSchedule.push({
          date: moment(createDoctorSchedule.date).toDate(),
          policlinicId: createDoctorSchedule.policlinicId,
        });

        await doctorScheduleService.createPoliclinicSchedule(
          createDoctorSchedule.id,
          moment(createDoctorSchedule.date).toDate(),
          createDoctorSchedule.policlinicId,
        );
      } catch (error) {
        errorMessage = error.message;
      }
      expect(errorMessage).toBe('Doctor is not available!');
    });
  });
});
