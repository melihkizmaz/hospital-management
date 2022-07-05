import { IsNotEmpty } from 'class-validator';

export class PoliclinicDto {
  @IsNotEmpty()
  title: string;
}
