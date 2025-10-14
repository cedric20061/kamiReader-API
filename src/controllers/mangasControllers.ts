import { Request, Response } from "express";
import { Browser } from "puppeteer-core";
import initBrowser from "@services/initBrowser";
import initPage from "@services/initPage";
import closeBrowser from "@services/closeBrowser";
import { SCRAPER_SOURCES } from "@lib/scraperConfig";

/**
 * Contrôleur générique de scraping.
 * Compatible avec tous les sites et types de pages configurés dans `scraperConfig.ts`
 */
export const scrapeMangaData = async (req: Request, res: Response) => {
  const {
    platform = "weebcentral",
    pageType = "popular",
    slug = "", // utile pour les pages de détails
    numberOfItems = 10, // anciennement numberOfManga
  } = req.body;

  const platformConfig = SCRAPER_SOURCES[platform];
  if (!platformConfig) {
    return res.status(400).json({
      error: `Platform '${platform}' not supported.`,
      supportedPlatforms: Object.keys(SCRAPER_SOURCES),
    });
  }

  const pageConfig = platformConfig.pages[pageType];
  if (!pageConfig) {
    return res.status(400).json({
      error: `Page type '${pageType}' not supported for platform '${platform}'.`,
      supportedPages: Object.keys(platformConfig.pages),
    });
  }

  // Génération dynamique de l’URL (remplace {slug} si présent)
  const urlPath = pageConfig.urlPath.includes("{slug}")
    ? pageConfig.urlPath.replace("{slug}", slug)
    : pageConfig.urlPath;
  const url = `${platformConfig.baseUrl}${urlPath}`;

  let browser: Browser | null = null;

  try {
    browser = await initBrowser();

    const page = await initPage(browser);

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    
    // Si la page a un container (ex: popular/latest)
    if (pageConfig.container) {
      const elements = await page.$$(pageConfig.container);

      const data = await Promise.all(
        elements.slice(0, numberOfItems).map(async (el) => {
          const item: Record<string, string | string[]> = {};

          for (const [key, field] of Object.entries(pageConfig.fields)) {
            try {
              if (field.multiple) {
                // Extraction multiple (tableaux : genres, auteurs, chapitres...)
                item[key] = await el.$$eval(
                  field.selector,
                  (nodes, attr) => {
                    return nodes
                      .map((n) => {
                        if (attr === "text") return n.textContent?.trim() || "";
                        if (attr === "src") return (n as HTMLImageElement).src;
                        if (attr === "href") return (n as HTMLAnchorElement).href;
                        return "";
                      })
                      .filter(Boolean);
                  },
                  field.attribute || "text"
                );
              } else {
                // Extraction simple
                item[key] = await el.$eval(
                  field.selector,
                  (n, attr) => {
                    if (attr === "text") return n.textContent?.trim() || "";
                    if (attr === "src") return (n as HTMLImageElement).src;
                    if (attr === "href") return (n as HTMLAnchorElement).href;
                    return "";
                  },
                  field.attribute || "text"
                );
              }
            } catch {
              item[key] = field.multiple ? [] : "";
            }
          }

          return item;
        })
      );

      await closeBrowser(browser);
      return res
        .status(200)
        .json({ platform, pageType, count: data.length, data });
    }

    // Si c’est une page sans container (ex: détail d’un manga)
    else {
      const container = await page.$(pageConfig.fields.image?.selector || "body");
      if (!container) throw new Error("Container not found on details page");

      const item: Record<string, string | string[]> = {};

      for (const [key, field] of Object.entries(pageConfig.fields)) {
        try {
          if (field.multiple) {
            item[key] = await page.$$eval(
              field.selector,
              (nodes, attr) => {
                return nodes
                  .map((n) => {
                    if (attr === "text") return n.textContent?.trim() || "";
                    if (attr === "src") return (n as HTMLImageElement).src;
                    if (attr === "href") return (n as HTMLAnchorElement).href;
                    return "";
                  })
                  .filter(Boolean);
              },
              field.attribute || "text"
            );
          } else {
            item[key] = await page.$eval(
              field.selector,
              (n, attr) => {
                if (attr === "text") return n.textContent?.trim() || "";
                if (attr === "src") return (n as HTMLImageElement).src;
                if (attr === "href") return (n as HTMLAnchorElement).href;
                return "";
              },
              field.attribute || "text"
            );
          }
        } catch {
          item[key] = field.multiple ? [] : "";
        }
      }

      await closeBrowser(browser);
      console.log("item: ", item)
      return res.status(200).json({ platform, pageType, data: item });
    }
  } catch (error) {
    console.error(`[Scraper:${platform}:${pageType}] Error:`, error);
    if (browser) await closeBrowser(browser);
    return res.status(500).json({
      error: "An error occurred during scraping.",
      details: (error as Error).message,
    });
  }
};
