import request from "supertest";
import express from "express";
import router from "@routes/libraryRoutes";
import prisma from "@config/prisma";

const app = express();
app.use(express.json());
app.use("/library", router);

describe("Library Routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("GET /library/user/:userId", async () => {
    (prisma.library.findMany as jest.Mock).mockResolvedValue([{ id: "1" }]);

    const res = await request(app).get("/library/user/123");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: "1" }]);
  });

  test("POST /library", async () => {
    (prisma.library.create as jest.Mock).mockResolvedValue({ id: "l1", name: "Fav" });

    const res = await request(app).post("/library").send({
      userId: "u1",
      name: "Fav",
    });

    expect(res.statusCode).toBe(201);
  });

  test("POST /library/:libraryId/manga", async () => {
    (prisma.libraryItem.create as jest.Mock).mockResolvedValue({ id: "m1" });

    const res = await request(app)
      .post("/library/l1/manga")
      .send({ slug: "x", domain: "manga", progress: 1 });

    expect(res.statusCode).toBe(201);
  });

  test("PUT /library/manga/:itemId", async () => {
    (prisma.libraryItem.update as jest.Mock).mockResolvedValue({ id: "i1" });

    const res = await request(app)
      .put("/library/manga/i1")
      .send({ progress: 10 });

    expect(res.statusCode).toBe(200);
  });

  test("DELETE /library/manga/:itemId", async () => {
    (prisma.libraryItem.delete as jest.Mock).mockResolvedValue({});

    const res = await request(app).delete("/library/manga/xx");

    expect(res.statusCode).toBe(204);
  });
});
