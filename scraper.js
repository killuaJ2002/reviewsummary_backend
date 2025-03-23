const puppeteer = require("puppeteer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scrapeReviews(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--window-size=800,3200"],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 3200 });

  try {
    await page.goto(url, { timeout: 60000 });
    await page.waitForSelector(".jftiEf", { timeout: 30000 });

    const reviews = await page.$$eval(".jftiEf", async (elements) => {
      return elements
        .map((element) => {
          const moreBtn = element.querySelector(".w8nwRe");
          if (moreBtn) moreBtn.click();

          const snippet = element.querySelector(".MyEned");
          return snippet ? snippet.textContent.trim() : null;
        })
        .filter(Boolean);
    });

    return reviews;
  } finally {
    await browser.close();
  }
}

async function summarize(reviews) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Summarize these reviews:\n${reviews.join("\n")}`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { scrapeReviews, summarize };
