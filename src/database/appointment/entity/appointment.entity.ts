import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Doctor } from 'src/database/doctor/entity/doctor.entity';
import { Policlinic } from 'src/database/policlinic/entity/policlinic.entity';
import { User } from 'src/database/user/user.entity/user.entity';

@Schema()
export class Appointment {
  _id?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Doctor' })
  doctor: Doctor | Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Policlinic' })
  policlinic: Policlinic | Types.ObjectId;

  @Prop({ required: true, default: false })
  isCanceled: boolean;

  @Prop({ required: true })
  startDate: Date;
}

export type AppointmentDocument = Appointment & Document;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
