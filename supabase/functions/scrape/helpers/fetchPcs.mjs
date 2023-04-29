import cheerio from "cheerio";
import axios from "axios";

const BASE_PCS = "https://www.procyclingstats.com/";
const LATEST_RESULTS = `${BASE_PCS}calendar/uci/latest-results`;

const fetchPcsData = async (gameId) => {
  const result = await axios.get(LATEST_RESULTS);
  // console.log(result.data);
  const $ = await cheerio.load(result.data);

  let links = [];
  $(".page-content")
    .find("a")
    .each((i, link) => {
      links.push($(link).attr("href"));
    });

  const raceResult = await axios.get(`${BASE_PCS}${links[0]}`);
  const $race = await cheerio.load(raceResult.data);
  const top3 = $race(".results > tbody > tr");

  // Get the top 3 finishers
  let top3Names = [];
  for (let i = 0; i < 3; i++) {
    let el = $race(top3[i]).find("td").find("a");
    if (el.attr("href").startsWith("rider")) {
      // console.log(el);
      top3Names.push(el.first().text().toLowerCase());
    }
  }

  console.log(top3Names);
};

fetchPcsData();
