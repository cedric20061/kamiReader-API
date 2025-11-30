import "module-alias/register";
import moduleAlias from "module-alias";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mangasRoutes from "@routes/mangasRoutes";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "@lib/auth";
dotenv.config();

// Alias uniquement en production
if (process.env.NODE_ENV === "production") {
  moduleAlias.addAliases({
    "@models": __dirname + "/src/models",
    "@controllers": __dirname + "/src/controllers",
    "@middlewares": __dirname + "/src/middlewares",
    "@routes": __dirname + "/src/routes",
    "@config": __dirname + "/src/config",
    "@types": __dirname + "/types",
    "@utils": __dirname + "/src/utils",
  });
}

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.all("/api/auth/*", toNodeHandler(auth));
app.use(
  cors({
    origin: process.env.HOST_NAME,
    credentials: true,
  })
);

app.use(mangasRoutes);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.HOST_NAME || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// ✅ Réponse JSON pour le test
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hello world" });
});

// ⚠️ Démarrage du serveur uniquement si pas en test
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}


export default app;
