import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { User, UserDocument } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name)
    private readonly userRepository: Model<UserDocument>,
  ) {}

  async create(user: UserDocument) {
    return await this.userRepository.create(user);
  }

  async findOne(query: FilterQuery<User>) {
    return await this.userRepository.findOne(query).exec();
  }
}
