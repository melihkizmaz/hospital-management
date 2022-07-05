import { IsDateString, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

export class CreateInputDto {
  @IsNotEmpty()
  doctor: Types.ObjectId;

  @IsNotEmpty()
  policlinic: Types.ObjectId;

  @IsNotEmpty()
  user: Types.ObjectId;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;
}
