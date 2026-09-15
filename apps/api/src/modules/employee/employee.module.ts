import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module.js";
import { EmployeeService } from "./employee.service.js";
import { EmployeeController } from "./employee.controller.js";

@Module({
  imports: [PrismaModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
