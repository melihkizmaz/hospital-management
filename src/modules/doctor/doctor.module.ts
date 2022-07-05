import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { DoctorScheduleService } from './doctor-schedule.service';
import { DoctorController } from './doctor.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [DoctorController],
  providers: [DoctorScheduleService],
})
export class DoctorModule {}
