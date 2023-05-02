// Run with node --experimental-modules supabase/functions/scrape/pcs/rider.mjs

import cheerio from "cheerio";
import axios from "axios";

const BASE_PCS = "https://www.procyclingstats.com/";
const YEAR = new Date().getFullYear();
const RIDER = `${BASE_PCS}rider/soren-kragh-andersen/`;

const fetchPcsData = async (gameId) => {
  let itts = [];

  const result = await axios.get(RIDER);
  // console.log(result.data);
  const $ = await cheerio.load(result.data);

  itts = $("a").filter(function () {
    console.log($(this).text());
    return $(this).text().indexOf("ITT") > -1;
  });
  console.log(itts.length);
  //   console.log(itts);
};

fetchPcsData();
