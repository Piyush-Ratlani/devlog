import request from "supertest";
import app from "../index";
import { prisma } from "../config/prisma";

const testUser = {
  name: "Entry Test User",
  email: "entrytest@test.com",
  password: "password123",
};

const testEntry = {
  date: "2026-03-22",
  hours: 6,
  project: "Devlog",
  tags: ["typescript", "backend"],
  mood: "great",
  notes: "Building tests",
};

describe("Entry Routes", () => {
  let accessToken: string;
  let createdEntryId: string;

  beforeAll(async () => {
    // Clean up and create fresh test user
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.entry.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });

    // Register and login to get access token
    await request(app).post("/api/auth/register").send(testUser);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    accessToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.entry.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  // ── Create Entry ───────────────────────────────────────────────
  describe("POST /api/entries", () => {
    it("should create an entry and return it with tags", async () => {
      const res = await request(app)
        .post("/api/entries")
        .set("Authorization", `Bearer ${accessToken}`)
        .send(testEntry);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.project).toBe(testEntry.project);
      expect(res.body.data.tags).toHaveLength(2);
      expect(res.body.data.mood).toBe(testEntry.mood);

      createdEntryId = res.body.data.id;
    });

    it("should return 401 without token", async () => {
      const res = await request(app).post("/api/entries").send(testEntry);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid or expired token");
    });

    it("should return 400 if hours exceed 24", async () => {
      const res = await request(app)
        .post("/api/entries")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...testEntry, hours: 25 });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.errors[0].field).toBe("hours");
    });

    it("should return 400 if mood is invalid", async () => {
      const res = await request(app)
        .post("/api/entries")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...testEntry, mood: "horrible" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.errors[0].field).toBe("mood");
    });

    it("should return 400 if tags array is empty", async () => {
      const res = await request(app)
        .post("/api/entries")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...testEntry, tags: [] });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.errors[0].field).toBe("tags");
    });

    it("should return 400 if date format is invalid", async () => {
      const res = await request(app)
        .post("/api/entries")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ ...testEntry, date: "22-03-2026" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
      expect(res.body.errors[0].field).toBe("date");
    });
  });

  // ── Get Entries ────────────────────────────────────────────────
  describe("GET /api/entries", () => {
    it("should return all entries for the authenticated user", async () => {
      const res = await request(app)
        .get("/api/entries")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("should return 401 without token", async () => {
      const res = await request(app).get("/api/entries");

      expect(res.status).toBe(401);
    });

    it("should filter entries by tag", async () => {
      const res = await request(app)
        .get("/api/entries?tags=typescript")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      res.body.data.forEach((entry: any) => {
        const tagNames = entry.tags.map((t: any) => t.name);
        expect(tagNames).toContain("typescript");
      });
    });

    it("should filter entries by project", async () => {
      const res = await request(app)
        .get("/api/entries?project=DevLog")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((entry: any) => {
        expect(entry.project).toBe("DevLog");
      });
    });

    it("should return empty array for non-matching filter", async () => {
      const res = await request(app)
        .get("/api/entries?project=NonExistentProject")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  // ── Delete Entry ───────────────────────────────────────────────
  describe("DELETE /api/entries/:id", () => {
    it("should delete an entry by id", async () => {
      const res = await request(app)
        .delete(`/api/entries/${createdEntryId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Entry deleted successfully");
    });

    it("should return 404 for non-existent entry", async () => {
      const res = await request(app)
        .delete("/api/entries/non-existent-id")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Entry not found");
    });

    it("should return 401 without token", async () => {
      const res = await request(app).delete(`/api/entries/${createdEntryId}`);

      expect(res.status).toBe(401);
    });
  });
});
