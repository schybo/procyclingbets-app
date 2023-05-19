const axios = require('axios');
const { JSDOM } = require('jsdom');
const fs = require('fs');

// URL of the La Flamme Rouge website
const url = 'https://www.la-flamme-rouge.eu/maps/viewtrack/505144';

axios.get(url)
  .then(response => {
    // Create a virtual DOM using jsdom
    const { window } = new JSDOM(response.data);

    // Access the DOM API
    const { document } = window;

    // Find the canvas map element by its ID (adjust the ID as needed)
    const canvas = document.querySelector('#altitudeCanvas');

    if (canvas) {
      // Extract the data URL of the canvas element
      const dataUrl = canvas.getAttribute('data-url');

      axios.get(dataUrl, { responseType: 'arraybuffer' })
        .then(imageResponse => {
          // Save the image data to a file (e.g., "map.png")
          fs.writeFileSync('map.png', Buffer.from(imageResponse.data));

          console.log('Map image saved successfully!');
        })
        .catch(error => {
          console.error('Failed to retrieve image data:', error);
        });
    } else {
      console.log('Canvas map element not found.');
    }
  })
  .catch(error => {
    console.error('Failed to fetch website data:', error);
  });
