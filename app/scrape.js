import { fstat } from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import fs from "fs";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

puppeteer.use(StealthPlugin());

async function scrape() {
  const browser = await puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    headless: false,
    userDataDir: "./tmp-profile",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-infobars",
      "--single-process",
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36"
  );

  await page.setViewport({ width: 1400, height: 1024 });
  await page.goto("https://www.psp.cz/", { waitUntil: "domcontentloaded" });
  await page.goto("https://www.psp.cz/sqw/hp.sqw?k=192&", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  const poslanci = await page.evaluate(() => {
    const elements = document.querySelectorAll(".name a");

    const namesArray = [];

    elements.forEach((element) => {
      const text = element.innerText;
      const href = element.getAttribute("href");
      const parsedURL = new URL(`https://www.psp.cz/sqw/${href}`);
      const id = parsedURL.searchParams.get("id");

      namesArray.push({ name: text, url: href, id: id });
    });

    return namesArray;
  });

  const fullPoslanciData = [];

  await sleep(2000);

  for (const [index, poslanec] of poslanci.entries()) {
    const detailUrl = `https://www.psp.cz/sqw/${poslanec.url}`;
    try {
      await page.goto(detailUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      await sleep(1500);

      const klub = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll("a"));
        const klubEl = elements.find((el) =>
          el.textContent.includes("Poslanecký klub")
        );
        return klubEl ? klubEl.textContent : null;
      });

      fullPoslanciData.push({
        name: poslanec.name,
        url: poslanec.url,
        klub: klub,
      });
    } catch {}
  }

  fs.writeFile(
    "./app/_data/poslanci.json",
    JSON.stringify({ poslanci: fullPoslanciData }),
    (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Successful scrape");
      }
    }
  );

  await browser.close();
}

scrape();
