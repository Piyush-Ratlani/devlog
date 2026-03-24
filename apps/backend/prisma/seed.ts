import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.weeklySummary.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.entry.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();

  console.log("🧹 Cleaned existing data");

  // Create user
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.create({
    data: {
      name: "Dev User",
      email: "dev@devlog.com",
      password: hashedPassword,
    },
  });

  console.log(`👤 Created user: ${user.email}`);

  // Create entries
  const entries = [
    {
      date: new Date("2026-03-22"),
      hours: 6,
      project: "DevLog",
      mood: "great" as const,
      notes: "Set up monorepo structure and TypeScript config",
      tags: ["typescript", "backend", "setup"],
    },
    {
      date: new Date("2026-03-21"),
      hours: 5,
      project: "DevLog",
      mood: "good" as const,
      notes: "Built Express server with middleware and stub routes",
      tags: ["express", "middleware", "backend"],
    },
    {
      date: new Date("2026-03-20"),
      hours: 7,
      project: "DevLog",
      mood: "great" as const,
      notes: "Implemented Zod validation and shared types package",
      tags: ["typescript", "zod", "validation"],
    },
    {
      date: new Date("2026-03-19"),
      hours: 4,
      project: "DevLog",
      mood: "neutral" as const,
      notes: "PostgreSQL setup and Prisma schema design",
      tags: ["postgresql", "prisma", "database"],
    },
    {
      date: new Date("2026-03-18"),
      hours: 8,
      project: "DevLog",
      mood: "great" as const,
      notes: "Real auth with bcrypt, JWT, and refresh token rotation",
      tags: ["auth", "jwt", "backend", "security"],
    },
    {
      date: new Date("2026-03-17"),
      hours: 3,
      project: "ClientProject",
      mood: "bad" as const,
      notes: "Debugging legacy React Native issues",
      tags: ["react-native", "debugging"],
    },
    {
      date: new Date("2026-03-16"),
      hours: 5,
      project: "ClientProject",
      mood: "good" as const,
      notes: "Fixed navigation flow and state management",
      tags: ["react-native", "redux", "navigation"],
    },
  ];

  for (const entry of entries) {
    await prisma.entry.create({
      data: {
        date: entry.date,
        hours: entry.hours,
        project: entry.project,
        mood: entry.mood,
        notes: entry.notes,
        userId: user.id,
        tags: {
          connectOrCreate: entry.tags.map(tag => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });
  }

  console.log(`📝 Created ${entries.length} entries`);
  console.log("✅ Seeding complete");
  console.log("");
  console.log("Login credentials:");
  console.log("  Email:    dev@devlog.com");
  console.log("  Password: password123");
}

main()
  .catch(e => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
