import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async listLocations() {
    return this.prisma.location.findMany({
      where: { isActive: true },
      orderBy: [{ building: "asc" }, { name: "asc" }],
    });
  }

  async getLocationById(id: string) {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });
    if (!location) {
      throw new NotFoundException(`Location with ID "${id}" not found`);
    }
    return location;
  }
}
