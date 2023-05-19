// Run with node --experimental-modules supabase/functions/scrape/pcs/riderWins.mjs

import axios from "axios";
import cheerio from "cheerio";

// URL of the page to scrape
const url = "https://www.procyclingstats.com/rankings.php";

// Make a GET request to the page
axios
  .get(url)
  .then((response) => {
    // Load the HTML into Cheerio
    const $ = cheerio.load(response.data);

    // Find the table with the rider rankings
    const table = $("table#ranking");

    // Find all the rows in the table, except for the header row
    const rows = table.find("tr").slice(1);

    // Loop through each row and extract the rider name and win count
    rows.each((i, row) => {
      const name = $(row).find("td.rider a").text().trim();
      const wins = $(row).find("td.wins").text().trim();
      console.log(`${name}: ${wins} wins`);
    });
  })
  .catch((error) => {
    console.error(`Error fetching ${url}: ${error.message}`);
  });
