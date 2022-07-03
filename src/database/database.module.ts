import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Policlinic,
  PoliclinicSchema,
} from './policlinic/entity/policlinic.entity';
import { PoliclinicRepository } from './policlinic/entity/policlinic.repository';
import { User, UserSchema } from './user/user.entity/user.entity';
import { UserRepository } from './user/user.entity/user.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Policlinic.name, schema: PoliclinicSchema },
    ]),
  ],
  providers: [UserRepository, PoliclinicRepository],
  exports: [UserRepository, PoliclinicRepository],
})
export class DatabaseModule {}
