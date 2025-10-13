import puppeteer from "puppeteer";

const initBrowser = async () => {
  const buildEnv = process.env.BUILD_ENV;
  const isDev = process.env.NODE_ENV === "development";
  const isTest = process.env.NODE_ENV === "test"; // 👈 Ajout important
  const isUsingBrowserless =
    !!process.env.BROWSERLESS_URL && buildEnv !== "build-local";

  // ✅ Cas des tests locaux (Jest)
  if (isTest) {
    return await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
  }

  // ✅ Cas développement avec Browserless
  if (isDev && process.env.BROWSERLESS_URL) {
    return await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSERLESS_URL,
    });
  }

  // ✅ Cas production (Browserless)
  if (isUsingBrowserless) {
    return await puppeteer.connect({
      browserWSEndpoint: process.env.BROWSERLESS_URL,
    });
  }

  // ✅ Cas Docker/Linux (Chromium)
  return await puppeteer.launch({
    executablePath: "/usr/bin/chromium",
    headless: true,
    args: [
      "--no-sandbox",
      "--no-zygote",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      "--disable-software-rasterizer",
    ],
  });
};

export default initBrowser;
