require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { scrapeReviews, summarize } = require("./scraper");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/get-summary", async (req, res) => {
  try {
    const url = req.body.url;
    if (!url) return res.status(400).json({ error: "Missing URL" });

    const reviews = await scrapeReviews(url);
    if (!reviews.length)
      return res.status(404).json({ error: "No reviews found" });

    const summary = await summarize(reviews);
    res.json({ summary });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Node.js server running on port ${PORT}`));
