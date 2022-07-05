import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { PoliclinicController } from './policlinic.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [PoliclinicController],
  providers: [],
})
export class PoliclinicModule {}
