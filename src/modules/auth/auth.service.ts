import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/database/user/user.entity/user.entity';
import { UserRepository } from 'src/database/user/user.entity/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

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

  async login(loginUserDto: LoginUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      email: loginUserDto.email,
    });
    if (!user && user.valiadatePassword)
      throw new UnauthorizedException('Password or email is incorrect');
    const isPasswordValid = await user.valiadatePassword(loginUserDto.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Password or email is incorrect');

    return user;
  }
}
