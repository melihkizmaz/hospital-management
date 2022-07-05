import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IJwtPayload } from '../dto/jwt-payload.interface';
import { UserRepository } from 'src/database/user/user.entity/user.repository';
import { Types } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret'),
    });
  }

  async validate(payload: IJwtPayload) {
    let user = await this.userRepository.findOne({
      _id: new Types.ObjectId(payload.id),
    });
    if (!user) throw new UnauthorizedException();
    user = user.toObject();
    delete user.password;

    return user;
  }
}
