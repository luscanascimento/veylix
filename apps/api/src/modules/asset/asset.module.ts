import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AssetService } from "./services/AssetService.js";
import { AssetController } from "./asset.controller.js";

@Module({
  imports: [PrismaModule],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
