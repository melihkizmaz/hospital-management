import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ICurrentUser } from '../auth/dto/current-user.interface';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Types } from 'mongoose';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  async create(
    @CurrentUser() user: ICurrentUser,
    @Body() createAppointment: CreateAppointmentDto,
  ) {
    return await this.appointmentService.createAppointment(
      user._id,
      createAppointment,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancel')
  async cancel(@CurrentUser() user: ICurrentUser, @Param('id') id: string) {
    return await this.appointmentService.cancelAppointment(
      new Types.ObjectId(id),
      user._id,
    );
  }
}
