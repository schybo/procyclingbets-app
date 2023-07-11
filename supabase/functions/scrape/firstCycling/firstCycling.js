// Run with node --experimental-modules supabase/functions/scrape/laFlammeRouge/laFlammeRouge.mjs

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config()

const BASE_URL = `https://firstcycling.com/`

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY
const supabaseBucketName = 'raceMaps';

// Create a Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

const getInformationSidebox = ($) => {
  let el = null
  $('h3').each((index, element) => {
    const text = $(element).text();
    if (text.toLowerCase().includes('information')) {
      console.log("hellow")
      el = $(element).next()
    }
  });

  return el
}

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

      const sidebox = getInformationSidebox($)
      sidebox.children().each((i, el) => {
        const childText = $(el).text().trim();
        console.log(childText)
      })

      const distance = $(sidebox.children()[4]).text().trim()

      // $('img[class="aarbilde"]').each((index, element) => {
      //   const imageUrl = $(element).attr('src');
      //   mapImageUrls.push(imageUrl);
      // });

      // console.log("MAP URLS")
      // console.log(mapImageUrls)
      // for (let i = 0; i < mapImageUrls.length; i++) {
      //   const imageUrl = mapImageUrls[i];
      //   const fileName = `map_${i}.jpg`;
      //   const imageResponse = await axios.get(`${BASE_URL}${imageUrl}`, { responseType: 'stream' });

      //   // Upload image to Supabase storage
      //   const { data, error } = await supabase.storage.from(supabaseBucketName).upload(fileName, imageResponse.data);
      //   if (error) {
      //     console.error(`Failed to upload ${fileName} to Supabase:`, error);
      //   } else {
      //     console.log(`Uploaded ${fileName} to Supabase`);
      //   }

      //   // imageResponse.data.pipe(fs.createWriteStream(fileName));
      //   console.log(`Downloaded and uploaded ${fileName}`);
      // }
    } else {
      console.log('Failed to load the website');
    }
  } catch (error) {
    console.log('Error occurred while scraping:', error);
  }
}

scrapeFirstCycling();

