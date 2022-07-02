import { ConflictException, Injectable } from '@nestjs/common';
import { User } from 'src/database/user/user.entity/user.entity';
import { UserRepository } from 'src/database/user/user.entity/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}
  async register(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    if (user) throw new ConflictException('Email already taken');

    return await this.userRepository.create(createUserDto);
  }
}
