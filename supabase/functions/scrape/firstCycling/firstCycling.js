// Run with node --experimental-modules supabase/functions/scrape/laFlammeRouge/laFlammeRouge.mjs

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = `https://firstcycling.com/`

async function scrapeFirstCycling() {
  try {
    const response = await axios.get('https://firstcycling.com/race.php', {
      params: {
        r: 13,
        y: 2023,
        e: 21
      }
    });
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const mapImageUrls = [];

      $('img[class="aarbilde"]').each((index, element) => {
        const imageUrl = $(element).attr('src');
        mapImageUrls.push(imageUrl);
      });

      console.log("MAP URLS")
      console.log(mapImageUrls)
      for (let i = 0; i < mapImageUrls.length; i++) {
        const imageUrl = mapImageUrls[i];
        const fileName = `map_${i}.jpg`;
        const imageResponse = await axios.get(`${BASE_URL}${imageUrl}`, { responseType: 'stream' });
        imageResponse.data.pipe(fs.createWriteStream(fileName));
        console.log(`Downloaded ${fileName}`);
      }
    } else {
      console.log('Failed to load the website');
    }
  } catch (error) {
    console.log('Error occurred while scraping:', error);
  }
}

scrapeFirstCycling();

