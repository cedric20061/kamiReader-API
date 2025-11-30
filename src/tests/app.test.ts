import request from "supertest";
import app from "../../main";

describe("API Tests", () => {
  it("GET / should return Hello world", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("message", "Hello world");
  });
});
