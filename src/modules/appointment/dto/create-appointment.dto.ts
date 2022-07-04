import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  doctor: string;

  @IsNotEmpty()
  policlinic: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;
}
