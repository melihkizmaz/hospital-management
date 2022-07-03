import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false, id: false })
class PoliclicSchedule {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Policlinic' })
  policlinic: Types.ObjectId;
}

export const PoliclicScheduleSchema =
  SchemaFactory.createForClass(PoliclicSchedule);

@Schema()
export class Doctor {
  _id?: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ type: [PoliclicScheduleSchema] })
  policlinicSchedule: PoliclicSchedule[];
}

export type DoctorDocument = Doctor & Document;
export const DoctorSchema = SchemaFactory.createForClass(Doctor);
