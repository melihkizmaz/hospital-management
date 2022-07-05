import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Policlinic {
  _id?: string;

  @Prop({ required: true, unique: true })
  title: string;
}

export type PoliclinicDocument = Policlinic & Document;
export const PoliclinicSchema = SchemaFactory.createForClass(Policlinic);
