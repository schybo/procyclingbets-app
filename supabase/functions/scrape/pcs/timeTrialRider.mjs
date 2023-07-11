// Run with node --experimental-modules supabase/functions/scrape/pcs/timeTrialRider.mjs

import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";

const args = process.argv;
const rider = args[2] || "cian-uijtdebroeks";

const response = await gotScraping.get(
  `https://www.procyclingstats.com/rider/${rider}/results/career-points-time-trial`
);
const html = response.body;

// Use Cheerio to parse the HTML
const $ = cheerio.load(html);

// Select all the elements with the class name "athing"
const rankings = $(".basic");
// console.log(rankings["0"].children);

// Loop through the selected elements
for (const rank of rankings) {
  // console.log($(rank).find("+tbody"));
  // for (const r of $(rank).find("+tbody")) {
  //   console.log(r);
  // }
  const children = rank.children;
  for (const c of children) {
    if (c.name == "tbody") {
      // console.log($(c));
      for (const r of c.children) {
        // console.log($(r).text());
        const tds = $(r).find("td");
        console.log(tds.text());
        // console.log($(tds[4]).find("a").text());
        // for (const t of tds) {
        //   console.log($(t).text());
        // }
      }
    }
  }
  // Organize the extracted data in an object
  // const structuredData = {
  //   url: $(rank).find(".titleline a").attr("href"),
  //   rank: $(rank).find(".rank").text().replace(".", ""),
  //   title: $(rank).find(".titleline").text(),
  //   author: $(rank).find("+tr .hnuser").text(),
  //   points: $(rank).find("+tr .score").text().replace(" points", ""),
  // };
  // Log each element's strcutured data results to the console
  // console.log(structuredData);
}
