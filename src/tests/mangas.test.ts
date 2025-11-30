import request from "supertest";
import app from "../../main";
import * as browserService from "@services/initBrowser";
import * as pageService from "@services/initPage";
import * as closeService from "@services/closeBrowser";
import { SCRAPER_SOURCES } from "@lib/scraperConfig";

// --- MOCK DES SERVICES PUPPETEER ---
jest.mock("@services/initBrowser");
jest.mock("@services/initPage");
jest.mock("@services/closeBrowser");

describe("Scraper API", () => {
  const mockPage = {
    goto: jest.fn(),
    $$: jest.fn(),
    $: jest.fn(),
    $$eval: jest.fn(),
    $eval: jest.fn(),
  };

  const mockBrowser = {
    close: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 🧩 1️⃣ Cas : plateforme non supportée
  it("POST /mangas should return 400 if platform not supported", async () => {
    const res = await request(app)
      .post("/mangas")
      .send({ platform: "unknown" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // 🧩 2️⃣ Cas : pageType non supporté pour la plateforme
  it("POST /mangas should return 400 if pageType not supported", async () => {
    const platform = Object.keys(SCRAPER_SOURCES)[0];
    const res = await request(app)
      .post("/mangas")
      .send({ platform, pageType: "notExist" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // 🧩 3️⃣ Cas : succès avec container (liste)
  it("POST /mangas should return 200 and data for page with container", async () => {
    // Configuration du mock
    (browserService.default as jest.Mock).mockResolvedValue(mockBrowser);
    (pageService.default as jest.Mock).mockResolvedValue(mockPage);
    (closeService.default as jest.Mock).mockResolvedValue(true);

    // Simulation d’un site avec container
    mockPage.$$.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockPage.$$eval.mockResolvedValue(["Action", "Drama"]);
    mockPage.$eval.mockResolvedValue("Fake Title");

    const platform = Object.keys(SCRAPER_SOURCES)[0];
    const validPage = Object.keys(SCRAPER_SOURCES[platform].pages).find(
      (p) => SCRAPER_SOURCES[platform].pages[p].container
    );

    if (!validPage) return; // aucune page à container => ignorer le test

    const res = await request(app)
      .post("/mangas")
      .send({ platform, pageType: validPage, numberOfItems: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 🧩 4️⃣ Cas : succès sans container (détail)
  it("POST /mangas should return 200 for page without container", async () => {
    (browserService.default as jest.Mock).mockResolvedValue(mockBrowser);
    (pageService.default as jest.Mock).mockResolvedValue(mockPage);
    (closeService.default as jest.Mock).mockResolvedValue(true);

    mockPage.$.mockResolvedValue({}); // simulate container found
    mockPage.$$eval.mockResolvedValue(["Author 1", "Author 2"]);
    mockPage.$eval.mockResolvedValue("Manga Name");

    const platform = Object.keys(SCRAPER_SOURCES)[0];
    const validPage = Object.keys(SCRAPER_SOURCES[platform].pages).find(
      (p) => !SCRAPER_SOURCES[platform].pages[p].container
    );

    if (!validPage) return; // aucune page sans container => ignorer le test

    const res = await request(app)
      .post("/mangas")
      .send({ platform, pageType: validPage, slug: "naruto" });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data");
    expect(typeof res.body.data).toBe("object");
  });

  // 🧩 5️⃣ Cas : erreur pendant le scraping
  it("POST /mangas should return 500 if scraping fails", async () => {
    (browserService.default as jest.Mock).mockRejectedValue(
      new Error("Browser failed to launch")
    );

    const platform = Object.keys(SCRAPER_SOURCES)[0];
    const pageType = Object.keys(SCRAPER_SOURCES[platform].pages)[0];

    const res = await request(app)
      .post("/mangas")
      .send({ platform, pageType });

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("error");
  });
});
