import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { AssetService } from "./services/AssetService.js";
import { AssetController } from "./asset.controller.js";
import { MovementController } from "./movement.controller.js";

import { AuditModule } from "../audit/audit.module.js";

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [AssetController, MovementController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
