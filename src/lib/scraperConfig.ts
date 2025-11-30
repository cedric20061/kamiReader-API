// src/lib/scraperConfig.ts

export interface ScraperFieldConfig {
  selector: string;
  attribute?: "text" | "src" | "href";
  multiple?: boolean; // pour récupérer plusieurs valeurs
}

export interface ScraperPageSelectors {
  urlPath: string; // chemin relatif à baseUrl (ex: '/', '/hot-updates', '/series/{slug}')
  container?: string; // sélecteur principal pour les items ou le bloc principal
  fields: Record<string, ScraperFieldConfig>;
}

export interface ScraperConfig {
  baseUrl: string;
  pages: {
    popular?: ScraperPageSelectors;
    latest?: ScraperPageSelectors;
    details?: ScraperPageSelectors;
    [key: string]: ScraperPageSelectors | undefined;
  };
}

export const SCRAPER_SOURCES: Record<string, ScraperConfig> = {
  // === 🌐 WeebCentral ===
  weebcentral: {
    baseUrl: "https://weebcentral.com",
    pages: {
      // 🏆 POPULAR PAGE
      popular: {
        urlPath: "/hot-updates",
        container:
          "article.bg-base-100.hover\\:bg-base-300.md\\:relative.hidden.md\\:block.gap-4",
        fields: {
          title: { selector: "a > div:nth-of-type(2) > div", attribute: "text" },
          image: { selector: "a > div > picture > img", attribute: "src" },
          lastChapter: { selector: "a > div:nth-of-type(2) > div:nth-of-type(2)", attribute: "text" },
          link: { selector: "a", attribute: "href" },
          releaseDate: { selector: "div:nth-of-type(2) > a > div:nth-of-type(3) > time", attribute: "text" },
        },
      },

      // 🕒 LATEST UPDATES PAGE
      latest: {
        urlPath: "/",
        container:
          "article.bg-base-100.hover\\:bg-base-300.flex.items-center.gap-4",
        fields: {
          title: { selector: "a:nth-of-type(2) > div > div", attribute: "text" },
          image: { selector: "a > picture > img", attribute: "src" },
          link: { selector: "a:nth-of-type(2)", attribute: "href" },
          lastChapter: { selector: "a:nth-of-type(2) > div:nth-of-type(2) > span", attribute: "text" },
          lastUpdateDate: { selector: "a:nth-of-type(2) > div:nth-of-type(3) > time", attribute: "text" },
        },
      },

      // 📘 MANGA DETAILS PAGE
      details: {
        urlPath: "/series/{slug}", // {slug} sera remplacé dynamiquement
        container: "main > div > section",
        fields: {
          image: { selector: "section > section:nth-of-type(2) > picture > img", attribute: "src" },
          title: { selector: "section:nth-of-type(2) > h1", attribute: "text" },
          author: {
            selector: "section > section:nth-of-type(3) > ul > li span",
            attribute: "text",
            multiple: true,
          },
          genres: {
            selector: "section > section:nth-of-type(3) > ul > li:nth-of-type(2) span",
            attribute: "text",
            multiple: true,
          },
          releaseDate: {
            selector: "section > section:nth-of-type(3) > ul > li:nth-of-type(5) > span",
            attribute: "text",
          },
          synopsis: {
            selector: "section:nth-of-type(2) > section:nth-of-type(2) > ul > li p",
            attribute: "text",
            multiple: true,
          },
          latestUpdateDate: {
            selector:
              "section:nth-of-type(2) > section:nth-of-type(3) > div > div > a > time",
            attribute: "text",
          },
          chapters: {
            selector:
              "section:nth-of-type(2) > section:nth-of-type(3) > div > div > a",
            attribute: "href",
            multiple: true,
          },
          chapterTitle: {
            selector:
              "section:nth-of-type(2) > section:nth-of-type(3) > div > div > a span:nth-of-type(2) > span",
            attribute: "text",
            multiple: true,
          },
          chapterReleaseDate: {
            selector:
              "section:nth-of-type(2) > section:nth-of-type(3) > div > div > a time",
            attribute: "text",
            multiple: true,
          },
        },
      },
    },
  },

  // === 🌐 AsuraScanz (autre exemple pour l’extension future)
  asurascanz: {
    baseUrl: "https://asurascans.com",
    pages: {
      popular: {
        urlPath: "/",
        container: "div.listupd > div.bs",
        fields: {
          link: { selector: "div.bsx > a", attribute: "href" },
          image: { selector: "div.bsx > a > div.limit > img", attribute: "src" },
          title: { selector: "div.bsx > a > div.bigor > div.tt", attribute: "text" },
          lastChapter: { selector: "div.bsx > a > div.bigor > div.adds > div.epxs", attribute: "text" },
          rating: { selector: "div.bsx > a > div.bigor div.numscore", attribute: "text" },
        },
      },
    },
  },
};
