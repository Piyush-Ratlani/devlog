import request from "supertest";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaClient } from "../generated/prisma";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { AppModule } from "../app/app.module";
import cookieParser from "cookie-parser";
import { GlobalExceptionFilter } from "../app/filters/http-exception.filter";

const prisma = new PrismaClient();

const testUser = {
  name: "Test User",
  email: "authtest@test.com",
  password: "password123",
};

describe("Auth Routes", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Clean up this user before and after auth tests
  beforeEach(async () => {
    await prisma.refreshToken.deleteMany({
      where: { user: { email: testUser.email } },
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
  });

  // ── Register ────────────────────────────────────────────────────
  describe("POST /api/auth/register", () => {
    it("should register a new user and return accesstoken", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.body.data.user.email).toBe(testUser.email);
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("should return 409 if email already exists", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser);

      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.status).toBe("fail");
      expect(res.body.message).toBe("Email already in use");
    });

    it("should return 400 if email is invalid", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ ...testUser, email: "notanemail" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
    });

    it("should return 400 if password is too short", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ ...testUser, password: "123" });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
    });

    it("should return 400 if name is missing", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/register")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("fail");
    });
  });

  // ── Login ───────────────────────────────────────────────────────
  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser);
    });

    it("should login and return accessToken with refresh cookie", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("accessToken");
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(res.headers["set-cookie"][0]).toContain("refreshToken");
    });

    it("should return 401 for wrong password", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });

    it("should return 401 for non-existent email", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: "nobody@test.com", password: testUser.password });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid email or password");
    });
  });

  // ── Refresh ─────────────────────────────────────────────────────
  describe("POST /api/auth/refresh", () => {
    it("should return new accessToken when valid refresh cookie exists", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser);

      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      const cookies = loginRes.headers["set-cookie"];

      const refreshRes = await request(app.getHttpServer())
        .post("/api/auth/refresh")
        .set("Cookie", cookies);

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data).toHaveProperty("accessToken");
    });

    it("should return 401 if no refresh cookie", async () => {
      const res = await request(app.getHttpServer()).post("/api/auth/refresh");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Refresh token not found");
    });
  });

  // ── Logout ──────────────────────────────────────────────────────
  describe("POST /api/auth/logout", () => {
    it("should logout and clear refresh cookie", async () => {
      await request(app.getHttpServer())
        .post("/api/auth/register")
        .send(testUser);

      const loginRes = await request(app.getHttpServer())
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });

      const cookies = loginRes.headers["set-cookie"];

      const logoutRes = await request(app.getHttpServer())
        .post("/api/auth/logout")
        .set("Cookie", cookies);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.message).toBe("Logged out successfully");
    });
  });
});
