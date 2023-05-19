const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    // Launch a headless browser instance
    const browser = await puppeteer.launch({
        headless: false
    });

    // Open a new browser page
    const page = await browser.newPage();

    // Navigate to the La Flamme Rouge website
    await page.goto(`https://www.la-flamme-rouge.eu/maps/viewtrack/505144`, { waitUntil: 'load', timeout: 10000 });

    // Wait for the canvas map element to appear
    await page.waitForSelector('#altitudeCanvas');

    // Get the data URL of the canvas element
    const dataUrl = await page.evaluate(() => {
      const canvas = document.querySelector('#altitudeCanvas');
      return canvas.getAttribute('data-url');
    });

    // Fetch the image data from the data URL
    const imageBuffer = await page.goto(dataUrl).then(response => response.buffer());

    // Save the image data to a file (e.g., "map.png")
    fs.writeFileSync('map.png', imageBuffer);

    console.log('Map image saved successfully!');

    // Close the browser instance
    await browser.close();
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();