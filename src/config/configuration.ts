import { JwtSignOptions } from '@nestjs/jwt';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface Config {
  port: number;
  database: MongooseModuleOptions;
  jwtSecret: string;
  jwtSignOptions: JwtSignOptions;
}

const config = (): Config => ({
  port: Number(process.env.PORT),
  database: {
    uri: process.env.MONGODB_URI,
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtSignOptions: {
    expiresIn: process.env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  },
});
export default config;
