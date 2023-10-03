// Run with node --experimental-modules supabase/functions/scrape/laFlammeRouge/laFlammeRouge.mjs

import axios from "axios";
import cheerio from "cheerio";
import { createCanvas, loadImage } from "canvas";

// Solved with
// www.npmjs.com/package/crawlee

// Function to convert canvas to base64
function canvasToBase64(canvas) {
  return canvas.toDataURL().split(",")[1];
}

async function scrapeStageMap(stageNumber) {
  const url = `https://www.la-flamme-rouge.eu/maps/viewtrack/${stageNumber}`;

  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const cv = $("#altitudeCanvas");
      if (cv.length > 0) {
        const canvas = cv[0];
        document.getElementById('altitudeCanvas');

        // Get the width and height of the canvas
        const width = $(canvas).attr("width");
        const height = $(canvas).attr("height");
        console.log("WIdth", width)
        console.log("Height", height)

        // Create a new canvas using the same dimensions
        const newCanvas = createCanvas(width, height);
        const ctx = newCanvas.getContext("2d");

        // Load the image data from the canvas element
        // console.log(canvas.html().toDataURL());
        const dataUrl = $(canvas).attr('data-canvas');
        console.log(dataUrl)
        console.log(canvas)
        const imageData = $(canvas).toDataURL();

        // Load the image data onto the new canvas
        const image = await loadImage(imageData);
        ctx.drawImage(image, 0, 0, width, height);

        // Convert the new canvas to base64
        const base64Data = canvasToBase64(newCanvas);

        return base64Data;
      } else {
        console.log(`Map data not found for stage ${stageNumber}`);
      }
    } else {
      console.log(`Failed to retrieve stage ${stageNumber}`);
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
}

const stageNumber = 546563;
scrapeStageMap(stageNumber).then((stageMap) => {
  if (stageMap) {
    console.log(`Map for Stage ${stageNumber} of the Tour de France:`);
    console.log(stageMap);
  }
});
