import { PrismaClient, UserRole, AssetStatus, MovementType, MaintenanceStatus, MaintenancePriority } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed process...');

  // 1. Create Admin User
  const adminPasswordHash = await argon2.hash('admin123', {
    type: argon2.argon2id,
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@veylix.local' },
    update: {},
    create: {
      email: 'admin@veylix.local',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`User created: ${admin.email}`);

  // 2. Create Categories
  const categoryIT = await prisma.category.upsert({
    where: { code: 'CAT-IT-001' },
    update: {},
    create: {
      code: 'CAT-IT-001',
      name: 'IT Equipment',
      description: 'Laptops, Monitors, Peripherals',
    },
  });

  const categoryFurniture = await prisma.category.upsert({
    where: { code: 'CAT-FUR-001' },
    update: {},
    create: {
      code: 'CAT-FUR-001',
      name: 'Office Furniture',
      description: 'Chairs, Desks, Cabinets',
    },
  });
  console.log('Categories created.');

  // 3. Create Locations
  const locationHQ = await prisma.location.upsert({
    where: { code: 'LOC-HQ-001' },
    update: {},
    create: {
      code: 'LOC-HQ-001',
      name: 'Headquarters Main Office',
      building: 'Building A',
      floor: 'Floor 3',
      room: 'Room 301',
    },
  });

  const locationStorage = await prisma.location.upsert({
    where: { code: 'LOC-STG-001' },
    update: {},
    create: {
      code: 'LOC-STG-001',
      name: 'IT Storage Room',
      building: 'Building A',
      floor: 'Basement',
      room: 'B-05',
    },
  });
  console.log('Locations created.');

  // 4. Create Employees
  const employeeJohn = await prisma.employee.upsert({
    where: { employeeNumber: 'EMP-001' },
    update: {},
    create: {
      employeeNumber: 'EMP-001',
      name: 'John Doe',
      email: 'john.doe@veylix.local',
      department: 'Engineering',
      position: 'Senior Developer',
    },
  });

  const employeeJane = await prisma.employee.upsert({
    where: { employeeNumber: 'EMP-002' },
    update: {},
    create: {
      employeeNumber: 'EMP-002',
      name: 'Jane Smith',
      email: 'jane.smith@veylix.local',
      department: 'Human Resources',
      position: 'HR Manager',
    },
  });
  console.log('Employees created.');

  // 5. Create Assets
  const assetLaptop = await prisma.asset.upsert({
    where: { patrimonyNumber: 'PAT-IT-1001' },
    update: {},
    create: {
      patrimonyNumber: 'PAT-IT-1001',
      name: 'MacBook Pro 16"',
      brand: 'Apple',
      model: 'M3 Pro',
      serialNumber: 'C02ABC123456',
      categoryId: categoryIT.id,
      locationId: locationHQ.id,
      assignedEmployeeId: employeeJohn.id,
      status: AssetStatus.IN_USE,
      purchaseDate: new Date('2023-11-01T00:00:00Z'),
      purchaseValue: 2499.00,
      description: 'Developer laptop for John',
    },
  });

  const assetMonitor = await prisma.asset.upsert({
    where: { patrimonyNumber: 'PAT-IT-1002' },
    update: {},
    create: {
      patrimonyNumber: 'PAT-IT-1002',
      name: 'Dell UltraSharp 27"',
      brand: 'Dell',
      model: 'U2723QE',
      serialNumber: 'CN-123456',
      categoryId: categoryIT.id,
      locationId: locationStorage.id,
      status: AssetStatus.AVAILABLE,
      purchaseDate: new Date('2023-01-15T00:00:00Z'),
      purchaseValue: 650.00,
    },
  });
  console.log('Assets created.');

  // 6. Create Initial Movements
  // To keep it simple, we won't create movements via upsert easily (no unique constraint on just one easy field for seed besides ID).
  // But we have movementNumber which is unique.
  await prisma.assetMovement.upsert({
    where: { movementNumber: 'MOV-2024-001' },
    update: {},
    create: {
      movementNumber: 'MOV-2024-001',
      assetId: assetLaptop.id,
      toEmployeeId: employeeJohn.id,
      fromLocationId: locationStorage.id,
      toLocationId: locationHQ.id,
      reason: 'Initial assignment to developer',
      movementType: MovementType.ASSIGNMENT,
      performedByUserId: admin.id,
    },
  });
  console.log('Asset movements created.');

  console.log('Seed process completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
