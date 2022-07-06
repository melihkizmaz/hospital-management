import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { Doctor } from 'src/database/doctor/entity/doctor.entity';
import { DoctorRepository } from 'src/database/doctor/entity/doctor.repository';
import { DoctorScheduleService } from './doctor-schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { DoctorDto } from './dto/doctor.dto';

@Controller('admin/doctor')
export class DoctorController {
  constructor(
    private readonly doctorRepository: DoctorRepository,
    private readonly doctorScheduleService: DoctorScheduleService,
  ) {}

  @Post('create')
  async create(@Body() doctorDto: DoctorDto): Promise<Doctor> {
    return await this.doctorRepository.create(doctorDto);
  }

  @Post(':id/createSchedule')
  async createSchedule(
    @Param('id') id: string,
    @Body() createScheduleDto: CreateScheduleDto,
  ): Promise<Doctor> {
    if (id && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid doctor id!');
    }

    return await this.doctorScheduleService.createPoliclinicSchedule(
      id,
      createScheduleDto.date,
      createScheduleDto.policlinicId,
    );
  }

  @Get('list')
  async find(
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('q') searchQuery: string,
  ) {
    let query = {};
    if (searchQuery) {
      query = {
        fullName: { $regex: `.*${searchQuery}.*`, $options: 'i' },
      };
    }

    return await this.doctorRepository.find(query, limit, offset);
  }

  @Patch(':id/update')
  async update(
    @Param('id') id: string,
    @Body() policlinicDto: DoctorDto,
  ): Promise<Doctor> {
    if (id && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid doctor id!');
    }

    return await this.doctorRepository.update(
      { _id: new Types.ObjectId(id) },
      policlinicDto,
    );
  }

  @Delete(':id/delete')
  async delete(@Param('id') id: string) {
    if (id && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid doctor id!');
    }

    return await this.doctorRepository.delete(new Types.ObjectId(id));
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Doctor> {
    if (id && !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid doctor id!');
    }

    return await this.doctorRepository.findOne({
      _id: new Types.ObjectId(id),
    });
  }
}
