import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}

  async listEmployees() {
    return this.prisma.employee.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  async getEmployeeById(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    });
    if (!employee) {
      throw new NotFoundException(`Employee with ID "${id}" not found`);
    }
    return employee;
  }
}
