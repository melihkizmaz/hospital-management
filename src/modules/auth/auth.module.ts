import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Config } from 'src/config/configuration';
import { DatabaseModule } from 'src/database/database.module';
import { AllExceptionsFilter } from 'src/error/global.handler';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Config>) => ({
        secret: config.get('jwtSecret'),
        signOptions: config.get('jwtSignOptions'),
      }),
    }),
    DatabaseModule,
    ConfigModule,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
