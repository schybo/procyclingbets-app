// Run with node --experimental-modules supabase/functions/scrape/pcs/timeTrial.mjs

import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";

const response = await gotScraping.get("https://news.ycombinator.com/");
const html = response.body;

// Use Cheerio to parse the HTML
const $ = cheerio.load(html);

// Select all the elements with the class name "athing"
const articles = $(".athing");

// Loop through the selected elements
for (const article of articles) {
  // Organize the extracted data in an object
  const structuredData = {
    url: $(article).find(".titleline a").attr("href"),
    rank: $(article).find(".rank").text().replace(".", ""),
    title: $(article).find(".titleline").text(),
    author: $(article).find("+tr .hnuser").text(),
    points: $(article).find("+tr .score").text().replace(" points", ""),
  };

  // Log each element's strcutured data results to the console
  console.log(structuredData);
}
