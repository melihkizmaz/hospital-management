import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { DoctorDto } from 'src/modules/doctor/dto/doctor.dto';
import { Doctor, DoctorDocument } from './doctor.entity';

@Injectable()
export class DoctorRepository {
  constructor(
    @InjectModel(Doctor.name)
    private readonly doctorRepository: Model<DoctorDocument>,
  ) {}

  async create(doctorRepository: DoctorDto) {
    return await this.doctorRepository.create(doctorRepository);
  }

  async findOne(query: FilterQuery<Doctor>) {
    const foundDoctor = await this.doctorRepository.findOne(query).exec();
    if (!foundDoctor) throw new NotFoundException('Doctor not found!');
    return foundDoctor;
  }

  async find(filterQuery?: FilterQuery<Doctor>, limit = 10, offset = 0) {
    const [data, totalCount] = await Promise.all([
      this.doctorRepository.find(filterQuery).limit(limit).skip(offset).exec(),
      this.doctorRepository.count(filterQuery),
    ]);

    return {
      data,
      totalCount,
    };
  }
  async update(query: FilterQuery<Doctor>, update: Partial<Doctor>) {
    const updatedDoctor = await this.doctorRepository
      .findOneAndUpdate(query, update, {
        new: true,
      })
      .exec();
    if (!updatedDoctor) throw new NotFoundException('Doctor not found!');
    return updatedDoctor;
  }

  async delete(query: FilterQuery<Doctor>) {
    return await this.doctorRepository.deleteOne(query).exec();
  }
}
