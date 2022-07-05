import { JwtSignOptions } from '@nestjs/jwt';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export interface Config {
  port: number;
  database: MongooseModuleOptions;
  jwtSecret: string;
  jwtSignOptions: JwtSignOptions;
  mail: {
    auth: {
      user: string;
      pass: string;
    };
  };
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
  mail: {
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
});
export default config;
