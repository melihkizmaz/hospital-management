import { IsNotEmpty } from 'class-validator';
import { Policlinic } from 'src/database/policlinic/entity/policlinic.entity';

export class DoctorDto {
  @IsNotEmpty()
  fullName: string;

  policlinics: Policlinic;
}
