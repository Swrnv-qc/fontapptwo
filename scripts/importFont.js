// console.log("Importing font");

// console.log(`type ${process.argv[2]}`);
// console.log(`from ${process.argv[3]}`);

// const type = process.argv[2];
// const value = process.argv[3];

const process = require('process');
const https = require('https');

function handleUrlOption() {
  console.log('Imported using url');
}

function handleLocalOption() {
  console.log('Imported using local file path');
  // Add your logic for importing a font from a local file here
}

function handleStringOption(url) {
  https
    .get(url, response => {
      let responseData = '';
      response.on('data', chunk => {
        responseData += chunk;
      });

      response.on('end', () => {
        // console.log('Response Body:', responseData);
        console.log(extractFontUrl(responseData));
      });
    })
    .on('error', error => {
      console.error('Error fetching URL:', error);
    });
  // Add your logic for importing a font based on a string here
}

function extractFontUrl(cssString) {
  const urlRegex = /https:[^}]*\.ttf/; // Regex to match URL with .ttf extension
  const capturedUrl = cssString.match(urlRegex);

  if (capturedUrl) {
    return capturedUrl[0]; // Return the captured URL (without quotes)
  } else {
    console.error('No .ttf font URL found in the CSS code.');
    return null;
  }
}

const options = process.argv[2];

if (options.includes('url')) {
  handleUrlOption();
} else if (options.includes('local')) {
  handleLocalOption();
} else if (options.includes('string')) {
  const fontfamily =
    'https://fonts.googleapis.com/css2?family=' + process.argv[3];
  handleStringOption(fontfamily);
} else {
  console.error('Invalid option. Please use one of: -url, -local, or -string');
}

// const https = require('https'); // Use https for secure URLs
// const fs = require('fs');
// const path = require('path');

// function downloadFile(url, destination) {
//   return new Promise((resolve, reject) => {
//     const filename = path.basename(url); // Extract filename from URL
//     const fileStream = fs.createWriteStream(destination + filename);

//     https.get(url, (response) => {
//       if (response.statusCode !== 200) {
//         reject(new Error(`Failed to download file. Status Code: ${response.statusCode}`));
//         return;
//       }

//       response.pipe(fileStream);

//       fileStream.on('finish', () => {
//         fileStream.close();
//         resolve(destination + filename); // Return the downloaded file path
//       });

//       fileStream.on('error', (err) => {
//         reject(err);
//       });
//     }).on('error', (err) => {
//       reject(err);
//     });
//   });
// }

// // Example usage
// const url = 'https://example.com/font.ttf'; // Replace with your actual URL
// const destination = './fonts/'; // Replace with your desired download directory

// downloadFile(url, destination)
//   .then((filePath) => {
//     console.log(`File downloaded successfully: ${filePath}`);
//   })
//   .catch((err) => {
//     console.error('Error downloading file:', err);
//   });

// function showUrlResponse(url) {
//   https.get(url, (response) => {
//     let responseData = '';
//     response.on('data', (chunk) => {
//       responseData += chunk;
//     });

//     response.on('end', () => {
//       console.log('Response Status:', response.statusCode);
//       console.log('Response Headers:', response.headers);
//       console.log('Response Body:', responseData);
//     });
//   }).on('error', (error) => {
//     console.error('Error fetching URL:', error);
//   });
// }

// // Example usage: Replace 'https://www.example.com' with your desired URL
// const targetUrl = 'https://www.example.com';
// showUrlResponse(targetUrl);
