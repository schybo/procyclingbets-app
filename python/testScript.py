import requests
from bs4 import BeautifulSoup

# URL of the La Flamme Rouge website
url = "https://www.la-flamme-rouge.eu/maps/viewtrack/505144"

# Send a GET request to the website
response = requests.get(url)

# Create BeautifulSoup object from the response text
soup = BeautifulSoup(response.text, "html.parser")

# Find the canvas map element by its ID (adjust the ID as needed)
canvas = soup.find(id="altitudeCanvas")

if canvas:
    # Extract the data URL of the canvas element
    data_url = canvas["data-url"]

    # Send a GET request to the data URL
    image_response = requests.get(data_url)

    if image_response.status_code == 200:
        # Extract the image data from the response
        image_data = image_response.content

        # Save the image data to a file (e.g., "map.png")
        with open("map.png", "wb") as file:
            file.write(image_data)
            print("Map image saved successfully!")
    else:
        print("Failed to retrieve image data.")
else:
    print("Canvas map element not found.")