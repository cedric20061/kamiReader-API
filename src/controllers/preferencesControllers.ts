import { Request, Response } from "express";
import prisma from "@config/prisma";

/**
 * GET /preferences/:userId
 * Récupère les préférences d'un utilisateur
 */
export const getPreferences = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const preferences = await prisma.preference.findUnique({
      where: { userId },
    });

    if (!preferences) {
      const pref = await prisma.preference.create({
        data: {
          userId,
        },
      });
      res.status(201).json(pref);
    }

    res.json(preferences);
  } catch (e) {
    console.error("Erreur getPreferences:", e);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des préférences." });
  }
};

/**
 * POST /preferences/:userId
 * Crée les préférences d'un utilisateur (si elles n'existent pas)
 */
export const createPreferences = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { theme, language, notifications } = req.body;

  try {
    const exists = await prisma.preference.findUnique({
      where: { userId },
    });

    if (exists) {
      return res
        .status(400)
        .json({ message: "Les préférences existent déjà." });
    }

    const pref = await prisma.preference.create({
      data: {
        userId,
        theme,
        language,
        notifications,
      },
    });

    res.status(201).json(pref);
  } catch (e) {
    console.error("Erreur createPreferences:", e);
    res
      .status(500)
      .json({ message: "Erreur lors de la création des préférences." });
  }
};

/**
 * PUT /preferences/:userId
 * Met à jour les préférences existantes
 */
export const updatePreferences = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { theme, language, notifications } = req.body;

  try {
    const updatedPref = await prisma.preference.update({
      where: { userId },
      data: {
        theme,
        language,
        notifications,
      },
    });

    res.json(updatedPref);
  } catch (e: any) {
    console.error("Erreur updatePreferences:", e);

    if (e.code === "P2025") {
      return res.status(404).json({ message: "Préférences introuvables." });
    }

    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};

/**
 * DELETE /preferences/:userId
 * Supprime les préférences d'un utilisateur
 */
export const deletePreferences = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await prisma.preference.delete({
      where: { userId },
    });

    res.json({ message: "Préférences supprimées." });
  } catch (e) {
    console.error("Erreur deletePreferences:", e);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression des préférences." });
  }
};

/**
 * POST /preferences/upsert/:userId
 * Crée ou met à jour automatiquement les préférences
 */
export const upsertPreferences = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { theme, language, notifications } = req.body;

  try {
    const pref = await prisma.preference.upsert({
      where: { userId },
      update: { theme, language, notifications },
      create: {
        userId,
        theme,
        language,
        notifications,
      },
    });

    res.json(pref);
  } catch (e) {
    console.error("Erreur upsertPreferences:", e);
    res.status(500).json({ message: "Erreur lors de l'opération upsert." });
  }
};
