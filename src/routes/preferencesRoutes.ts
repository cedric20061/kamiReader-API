import { Router } from "express";
import {
  getPreferences,
  createPreferences,
  updatePreferences,
  deletePreferences,
  upsertPreferences,
} from "@controllers/preferencesControllers";

const router = Router();

// GET /preferences/:userId
router.get("/preferences/:userId", getPreferences);

// POST /preferences/:userId
router.post("/preferences/:userId", createPreferences);

// PUT /preferences/:userId
router.put("/preferences/:userId", updatePreferences);

// DELETE /preferences/:userId
router.delete("/preferences/:userId", deletePreferences);

// POST /preferences/upsert/:userId
router.post("/preferences/upsert/:userId", upsertPreferences);

export default router;
