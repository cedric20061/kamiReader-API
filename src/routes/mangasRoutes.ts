import express from "express";
import {
  scrapeMangaData,
} from "@controllers/mangasControllers";

const router = express.Router();

router.post("/mangas", scrapeMangaData);

export default router;
