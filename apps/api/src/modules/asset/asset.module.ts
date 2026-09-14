import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssetService } from './services/AssetService';

@Module({
  imports: [PrismaModule],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
