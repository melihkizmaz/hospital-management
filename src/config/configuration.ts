import { MongooseModuleOptions } from '@nestjs/mongoose';

interface Config {
  port: number;
  database: MongooseModuleOptions;
}

const config = (): Config => ({
  port: Number(process.env.PORT),
  database: {
    uri: process.env.MONGODB_URI,
  },
});
export default config;
