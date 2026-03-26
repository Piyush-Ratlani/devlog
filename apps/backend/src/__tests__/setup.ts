import { prisma } from "../config/prisma";

beforeAll(async () => {
  // Verify database connection before running tests
  await prisma.$connect();
});

afterAll(async () => {
  // Clean up test data and disconnect
  await prisma.weeklySummary.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});
