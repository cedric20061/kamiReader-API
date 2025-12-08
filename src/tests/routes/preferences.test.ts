import request from "supertest";
import express from "express";
import router from "@routes/preferencesRoutes";
import prisma from "@config/prisma";

/**
 * Mock Prisma AVANT utilisation des routes
 */
jest.mock("@config/prisma", () => ({
  __esModule: true,
  default: {
    preference: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

const app = express();
app.use(express.json());
app.use("/preferences", router);

describe("Preferences Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------
  // GET
  // ------------------------
  test("GET /preferences/:userId - retourne les préférences existantes", async () => {
    (prisma.preference.findUnique as jest.Mock).mockResolvedValue({
      userId: "u1",
      theme: "dark",
    });

    const res = await request(app).get("/preferences/u1");

    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe("u1");
  });

  test("GET /preferences/:userId - crée les préférences si inexistantes", async () => {
    (prisma.preference.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.preference.create as jest.Mock).mockResolvedValue({
      userId: "u1",
    });

    const res = await request(app).get("/preferences/u1");

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe("u1");
  });

  // ------------------------
  // POST
  // ------------------------
  test("POST /preferences/:userId - crée les préférences", async () => {
    (prisma.preference.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.preference.create as jest.Mock).mockResolvedValue({
      userId: "u1",
      theme: "dark",
    });

    const res = await request(app).post("/preferences/u1").send({
      theme: "dark",
      language: "fr",
      notifications: true,
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe("u1");
  });

  test("POST /preferences/:userId - refuse si les préférences existent déjà", async () => {
    (prisma.preference.findUnique as jest.Mock).mockResolvedValue({
      userId: "u1",
    });

    const res = await request(app).post("/preferences/u1");

    expect(res.statusCode).toBe(400);
  });

  // ------------------------
  // PUT
  // ------------------------
  test("PUT /preferences/:userId - met à jour les préférences", async () => {
    (prisma.preference.update as jest.Mock).mockResolvedValue({
      userId: "u1",
      theme: "light",
    });

    const res = await request(app)
      .put("/preferences/u1")
      .send({ theme: "light" });

    expect(res.statusCode).toBe(200);
    expect(res.body.theme).toBe("light");
  });

  test("PUT /preferences/:userId - retourne 404 si préférences inexistantes", async () => {
    (prisma.preference.update as jest.Mock).mockRejectedValue({
      code: "P2025",
    });

    const res = await request(app).put("/preferences/u1");

    expect(res.statusCode).toBe(404);
  });

  // ------------------------
  // DELETE
  // ------------------------
  test("DELETE /preferences/:userId - supprime les préférences", async () => {
    (prisma.preference.delete as jest.Mock).mockResolvedValue({});

    const res = await request(app).delete("/preferences/u1");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Préférences supprimées.");
  });

  // ------------------------
  // UPSERT
  // ------------------------
  test("POST /preferences/upsert/:userId - crée ou met à jour les préférences", async () => {
    (prisma.preference.upsert as jest.Mock).mockResolvedValue({
      userId: "u1",
      theme: "dark",
    });

    const res = await request(app).post("/preferences/upsert/u1").send({
      theme: "dark",
      language: "fr",
      notifications: true,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.userId).toBe("u1");
  });
});
