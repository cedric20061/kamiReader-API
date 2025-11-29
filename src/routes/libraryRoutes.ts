import { Router } from "express";
import {
  getUserLibraries,
  getLibraryById,
  createLibrary,
  addMangaToLibrary,
  updateManga,
  deleteManga
} from "@controllers/libraryControllers";

const router = Router();

// Libraries
router.get("/user/:userId", getUserLibraries);
router.get("/:libraryId", getLibraryById);
router.post("/", createLibrary);

// Manga items inside a library
router.post("/:libraryId/manga", addMangaToLibrary);
router.put("/manga/:itemId", updateManga);
router.delete("/manga/:itemId", deleteManga);

export default router;
