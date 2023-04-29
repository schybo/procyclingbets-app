import cheerio from "cheerio";
import axios from "axios";

const BASE_BET365 = "https://www.on.bet365.ca/";
const LINK = `#/AC/B38/C20883955/D1/E89442124/F2/`;

const fetchBet365Data = async (gameId) => {
  const result = await axios.get(`${BASE_BET365}${LINK}`);
  // console.log(result.data);
  const $ = await cheerio.load(result.data);

  let links = [];
  $("gl-ParticipantBorderless_Name").each((i, el) => {
    console.log(el.text());
  });
};

fetchBet365Data();
