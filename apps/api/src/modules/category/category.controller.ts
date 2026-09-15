import { Controller, Get, Param } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from "@nestjs/swagger";
import { CategoryService } from "./category.service.js";
import { Roles } from "../../common/decorators/roles.decorator.js";
import { UserRole } from "@veylix/types";

@ApiTags("Categories")
@ApiBearerAuth()
@ApiCookieAuth("veylix_session")
@Controller("categories")
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "List all active asset categories" })
  @ApiResponse({ status: 200, description: "List of active categories" })
  async listCategories() {
    return this.categoryService.listCategories();
  }

  @Get(":id")
  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER)
  @ApiOperation({ summary: "Get category details by ID" })
  @ApiResponse({ status: 200, description: "Category details" })
  @ApiResponse({ status: 404, description: "Category not found" })
  async getCategoryById(@Param("id") id: string) {
    return this.categoryService.getCategoryById(id);
  }
}
