import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../database/user/user.entity/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { IJwtPayload } from './dto/jwt-payload.interface';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<string> {
    const user = await this.userRepository.findOne({
      email: createUserDto.email,
    });
    if (user) throw new ConflictException('Email already taken');

    const createdUser = await this.userRepository.create(createUserDto);
    const token = await this.generateJwt({
      id: createdUser.id,
      email: createdUser.email,
    });
    return token;
  }

  async login(loginUserDto: LoginUserDto): Promise<string> {
    const user = await this.userRepository.findOne({
      email: loginUserDto.email,
    });
    if (!user)
      throw new UnauthorizedException('Password or email is incorrect');

    const isPasswordValid = await user.valiadatePassword(loginUserDto.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Password or email is incorrect');

    const token = await this.generateJwt({
      id: user.id,
      email: user.email,
    });
    return token;
  }

  async generateJwt(payload: IJwtPayload): Promise<string> {
    return this.jwtService.signAsync({ id: payload.id, email: payload.email });
  }
}
