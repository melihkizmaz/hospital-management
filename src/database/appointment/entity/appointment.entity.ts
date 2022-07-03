import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Appointment {
  _id?: string;

  @Prop({ required: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  doctor: Types.ObjectId;

  @Prop({ required: true })
  policlinic: Types.ObjectId;

  @Prop({ required: true })
  startDate: Types.ObjectId;
}

export type AppointmentDocument = Appointment & Document;
export const AppointmentSchema = SchemaFactory.createForClass(Appointment);
