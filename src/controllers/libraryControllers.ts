import { Request, Response } from "express";
import prisma from "@config/prisma";

/**
 * Get all libraries of a user
 */
export const getUserLibraries = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const libraries = await prisma.library.findMany({
      where: { userId },
      include: { mangas: true },
    });

    res.json(libraries);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des bibliothèques." });
  }
};

/**
 * Get a single library with its manga list
 */
export const getLibraryById = async (req: Request, res: Response) => {
  const { libraryId } = req.params;

  try {
    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: { mangas: true },
    });

    if (!library) {
      return res.status(404).json({ message: "Library introuvable." });
    }

    res.json(library);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

/**
 * Create a library
 */
export const createLibrary = async (req: Request, res: Response) => {
  const { userId, name } = req.body;

  try {
    const library = await prisma.library.create({
      data: {
        userId,
        name,
      },
    });

    res.status(201).json(library);
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de la bibliothèque." });
  }
};

/**
 * Add a manga to a library
 */
export const addMangaToLibrary = async (req: Request, res: Response) => {
  const { libraryId } = req.params;
  const { slug, domain, progress } = req.body;

  try {
    const item = await prisma.libraryItem.create({
      data: {
        libraryId,
        slug,
        domain,
        progress: progress ?? 0,
      },
    });

    res.status(201).json(item);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Erreur lors de l'ajout du manga." });
  }
};

/**
 * Update manga
 */
export const updateManga = async (req: Request, res: Response) => {
  const { itemId } = req.params;
  const { slug, domain, progress } = req.body;

  try {
    const updated = await prisma.libraryItem.update({
      where: { id: itemId },
      data: { slug, domain, progress },
    });

    res.json(updated);
  } catch (e: any) {
    if (e.code === "P2025") {
      return res.status(404).json({ message: "Manga introuvable." });
    }

    console.error(e);
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};

/**
 * Delete manga
 */
export const deleteManga = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  try {
    await prisma.libraryItem.delete({
      where: { id: itemId },
    });

    res.status(204).send();
  } catch (e: any) {
    if (e.code === "P2025") {
      return res.status(404).json({ message: "Manga introuvable." });
    }

    console.error(e);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};
