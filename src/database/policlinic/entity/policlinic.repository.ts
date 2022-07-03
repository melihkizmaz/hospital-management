import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { PoliclinicDto } from 'src/modules/policlinic/dto/policlinic.dto';
import { Policlinic, PoliclinicDocument } from './policlinic.entity';

@Injectable()
export class PoliclinicRepository {
  constructor(
    @InjectModel(Policlinic.name)
    private readonly policlinicRepository: Model<PoliclinicDocument>,
  ) {}

  async create(policlinicCreateDto: PoliclinicDto) {
    return await this.policlinicRepository.create(policlinicCreateDto);
  }

  async findOne(query: FilterQuery<Policlinic>) {
    return await this.policlinicRepository.findOne(query).exec();
  }

  async find(filterQuery?: FilterQuery<Policlinic>, limit = 10, offset = 0) {
    const [data, totalCount] = await Promise.all([
      this.policlinicRepository
        .find(filterQuery)
        .limit(limit)
        .skip(offset)
        .exec(),
      this.policlinicRepository.count(),
    ]);

    return {
      data,
      totalCount,
    };
  }
  async update(query: FilterQuery<Policlinic>, update: Partial<Policlinic>) {
    return await this.policlinicRepository
      .findOneAndUpdate(query, update, {
        new: true,
      })
      .exec();
  }

  async delete(query: FilterQuery<Policlinic>) {
    return await this.policlinicRepository.deleteOne(query).exec();
  }
}
