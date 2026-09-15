import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { EmployeeService } from "./employee.service.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UserRole } from "@veylix/types";

@ApiTags("Employees")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("employees")
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "List all active corporate employees" })
  @ApiResponse({ status: 200, description: "List of active employees" })
  async listEmployees() {
    return this.employeeService.listEmployees();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "Get employee details by ID" })
  @ApiResponse({ status: 200, description: "Employee details" })
  @ApiResponse({ status: 404, description: "Employee not found" })
  async getEmployeeById(@Param("id") id: string) {
    return this.employeeService.getEmployeeById(id);
  }
}
