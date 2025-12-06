import request from "supertest";
import prisma from "@config/prisma";
import {
  getUserLibraries,
  getLibraryById,
  createLibrary,
  addMangaToLibrary,
  updateManga,
  deleteManga,
} from "@controllers/libraryControllers";

jest.mock("@config/prisma");

describe("Library Controllers", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = {
      json: jest.fn().mockReturnValue(undefined),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  // --------------------------
  // GET USER LIBRARIES
  // --------------------------
  test("getUserLibraries - succès", async () => {
    (prisma.library.findMany as jest.Mock).mockResolvedValue([{ id: "1", name: "Fav" }]);

    mockReq.params.userId = "123";

    await getUserLibraries(mockReq, mockRes);

    expect(prisma.library.findMany).toHaveBeenCalledWith({
      where: { userId: "123" },
      include: { mangas: true },
    });
    expect(mockRes.json).toHaveBeenCalledWith([{ id: "1", name: "Fav" }]);
  });

  // --------------------------
  // GET LIBRARY BY ID
  // --------------------------
  test("getLibraryById - not found", async () => {
    (prisma.library.findUnique as jest.Mock).mockResolvedValue(null);

    mockReq.params.libraryId = "l1";

    await getLibraryById(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  test("getLibraryById - succès", async () => {
    (prisma.library.findUnique as jest.Mock).mockResolvedValue({ id: "l1", name: "Lib" });

    mockReq.params.libraryId = "l1";

    await getLibraryById(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ id: "l1", name: "Lib" });
  });

  // --------------------------
  // CREATE LIBRARY
  // --------------------------
  test("createLibrary - succès", async () => {
    (prisma.library.create as jest.Mock).mockResolvedValue({ id: "l1", name: "Test" });

    mockReq.body = { userId: "u1", name: "Test" };

    await createLibrary(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ id: "l1", name: "Test" });
  });

  // --------------------------
  // ADD MANGA
  // --------------------------
  test("addMangaToLibrary - succès", async () => {
    (prisma.libraryItem.create as jest.Mock).mockResolvedValue({ id: "m1" });

    mockReq.params.libraryId = "l1";
    mockReq.body = { slug: "solo-leveling", domain: "manga", progress: 3 };

    await addMangaToLibrary(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  // --------------------------
  // UPDATE MANGA
  // --------------------------
  test("updateManga - erreur P2025", async () => {
    (prisma.libraryItem.update as jest.Mock).mockRejectedValue({ code: "P2025" });

    mockReq.params.itemId = "i123";

    await updateManga(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(404);
  });

  // --------------------------
  // DELETE MANGA
  // --------------------------
  test("deleteManga - succès", async () => {
    (prisma.libraryItem.delete as jest.Mock).mockResolvedValue({});

    mockReq.params.itemId = "item1";

    await deleteManga(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(204);
  });
});
