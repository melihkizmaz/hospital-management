import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Policlinic } from 'src/database/policlinic/entity/policlinic.entity';
import { PoliclinicRepository } from 'src/database/policlinic/entity/policlinic.repository';
import { PoliclinicDto } from './dto/policlinic.dto';
import { Types } from 'mongoose';

@Controller('admin/policlinic')
export class PoliclinicController {
  constructor(private readonly policlinicRepository: PoliclinicRepository) {}

  @Post('create')
  async create(@Body() policlinicDto: PoliclinicDto): Promise<Policlinic> {
    return await this.policlinicRepository.create(policlinicDto);
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
        title: { $regex: `.*${searchQuery}.*`, $options: 'i' },
      };
    }
    return await this.policlinicRepository.find(query, limit, offset);
  }

  @Patch(':id/update')
  async update(
    @Param('id') id: string,
    @Body() policlinicDto: PoliclinicDto,
  ): Promise<Policlinic> {
    return await this.policlinicRepository.update(
      { _id: new Types.ObjectId(id) },
      policlinicDto,
    );
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Policlinic> {
    return await this.policlinicRepository.findOne({
      _id: new Types.ObjectId(id),
    });
  }
}
