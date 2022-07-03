import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';
import * as bcrypt from 'bcrypt';
@Schema()
export class User {
  _id?: Types.ObjectId;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  valiadatePassword?: (password: string) => Promise<boolean>;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.valiadatePassword = function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

/**
 * Checking User password changed
 * Hashing "User Password" before user saved to database.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.isNew) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 12);

  next();
});
