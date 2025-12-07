import prisma from "@config/prisma";
import {
  getPreferences,
  createPreferences,
  updatePreferences,
  deletePreferences,
  upsertPreferences,
} from "@controllers/preferencesControllers";

jest.mock("@config/prisma");

describe("Preferences Controllers", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    jest.clearAllMocks();
  });

  // --------------------------
  // GET PREFERENCES
  // --------------------------
  describe("getPreferences", () => {
    test("retourne les préférences existantes", async () => {
      (prisma.preference.findUnique as jest.Mock).mockResolvedValue({
        userId: "u1",
        theme: "dark",
      } as any);

      req.params.userId = "u1";

      await getPreferences(req, res);

      expect(prisma.preference.findUnique as jest.Mock).toHaveBeenCalledWith({
        where: { userId: "u1" },
      });
      expect(res.json).toHaveBeenCalledWith({
        userId: "u1",
        theme: "dark",
      });
    });

    test("crée des préférences si inexistantes", async () => {
      (prisma.preference.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.preference.create as jest.Mock).mockResolvedValue({
        userId: "u1",
      } as any);

      req.params.userId = "u1";

      await getPreferences(req, res);

      expect(prisma.preference.create as jest.Mock).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // --------------------------
  // CREATE PREFERENCES
  // --------------------------
  describe("createPreferences", () => {
    test("refuse si préférences déjà existantes", async () => {
      (prisma.preference.findUnique as jest.Mock).mockResolvedValue({
        userId: "u1",
      } as any);

      req.params.userId = "u1";

      await createPreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test("crée les préférences", async () => {
      (prisma.preference.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.preference.create as jest.Mock).mockResolvedValue({
        userId: "u1",
        theme: "dark",
      } as any);

      req.params.userId = "u1";
      req.body = {
        theme: "dark",
        language: "fr",
        notifications: true,
      };

      await createPreferences(req, res);

      expect(prisma.preference.create as jest.Mock).toHaveBeenCalledWith({
        data: {
          userId: "u1",
          theme: "dark",
          language: "fr",
          notifications: true,
        },
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // --------------------------
  // UPDATE PREFERENCES
  // --------------------------
  describe("updatePreferences", () => {
    test("met à jour les préférences", async () => {
      (prisma.preference.update as jest.Mock).mockResolvedValue({
        userId: "u1",
        theme: "light",
      } as any);

      req.params.userId = "u1";
      req.body = { theme: "light" };

      await updatePreferences(req, res);

      expect(prisma.preference.update as jest.Mock).toHaveBeenCalledWith({
        where: { userId: "u1" },
        data: { theme: "light", language: undefined, notifications: undefined },
      });
      expect(res.json).toHaveBeenCalled();
    });

    test("retourne 404 si préférences inexistantes", async () => {
      (prisma.preference.update as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      req.params.userId = "u1";

      await updatePreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // --------------------------
  // DELETE PREFERENCES
  // --------------------------
  describe("deletePreferences", () => {
    test("supprime les préférences", async () => {
      (prisma.preference.delete as jest.Mock).mockResolvedValue({} as any);

      req.params.userId = "u1";

      await deletePreferences(req, res);

      expect(prisma.preference.delete as jest.Mock).toHaveBeenCalledWith({
        where: { userId: "u1" },
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Préférences supprimées.",
      });
    });
  });

  // --------------------------
  // UPSERT PREFERENCES
  // --------------------------
  describe("upsertPreferences", () => {
    test("crée ou met à jour les préférences", async () => {
      (prisma.preference.upsert as jest.Mock).mockResolvedValue({
        userId: "u1",
        theme: "dark",
      } as any);

      req.params.userId = "u1";
      req.body = {
        theme: "dark",
        language: "fr",
        notifications: true,
      };

      await upsertPreferences(req, res);

      expect(prisma.preference.upsert as jest.Mock).toHaveBeenCalledWith({
        where: { userId: "u1" },
        update: {
          theme: "dark",
          language: "fr",
          notifications: true,
        },
        create: {
          userId: "u1",
          theme: "dark",
          language: "fr",
          notifications: true,
        },
      });

      expect(res.json).toHaveBeenCalled();
    });
  });
});
