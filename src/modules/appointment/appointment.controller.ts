import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ICurrentUser } from '../auth/dto/current-user.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { FilterQuery } from 'mongoose';
import { Types } from 'mongoose';
import { AppointmentRepository } from 'src/database/appointment/entity/appointment.repository';
import {
  Appointment,
  AppointmentDocument,
} from 'src/database/appointment/entity/appointment.entity';

@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly appointmentRepository: AppointmentRepository,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() createAppointment: CreateAppointmentDto,
  ) {
    return await this.appointmentService.createAppointment(
      user,
      createAppointment,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@CurrentUser() user: ICurrentUser, @Param('id') id: string) {
    return await this.appointmentService.cancelAppointment(
      new Types.ObjectId(id),
      user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('list')
  async find(
    @CurrentUser() user: ICurrentUser,
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('doctorId') doctorId: string,
    @Query('policlinicId') policlinicId: string,
  ) {
    const query: FilterQuery<Appointment> = {
      user: user._id,
    };
    if (doctorId) {
      query.doctor = new Types.ObjectId(doctorId);
    }
    if (policlinicId) {
      query.policlinic = new Types.ObjectId(policlinicId);
    }
    const { data, totalCount } = await this.appointmentRepository.find(
      query,
      limit,
      offset,
    );

    return {
      data: this.mapAppointment(data),
      totalCount,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@CurrentUser() user: ICurrentUser, @Param('id') id: string) {
    return await this.appointmentService.findOneWithAuth(
      new Types.ObjectId(id),
      user._id,
    );
  }

  private mapAppointment(appointments: AppointmentDocument[]) {
    return appointments.map((appointment) => ({
      ...appointment.toObject(),
      status: appointment.startDate > new Date() ? 'feature' : 'past',
    }));
  }
}
