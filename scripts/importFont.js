const process = require('process');
const fs = require('fs');
const https = require('https');
const path = require('path');
const appDirectory = 'assets/fonts';
const webDirectory = 'src/public/assets/fonts';

// Create target directories if they don't exist
for (const targetDir of [appDirectory, webDirectory]) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {recursive: true});
  }
}

// Handle URL-based font option (extract font from URL)
function handleUrlOption(url, fontName) {
  extractFontUrl(url, fontName);
}

// Handle local font option (copy the font file)
function handleLocalOption(filename) {
  copyFile(filename);
}

// Handle font provided as a string (treat as URL and download)

function handleStringOption(url, fontName) {
  // Fetch the font data from the provided URL (assuming it's a URL)
  https
    .get(url, response => {
      let responseData = '';
      response.on('data', chunk => {
        responseData += chunk;
      });

      response.on('end', () => {
        // Once data is downloaded, treat it as font content and extract font
        extractFontUrl(responseData, fontName);
      });
    })
    .on('error', error => {
      console.error('Error fetching URL:', error);
    });
}

// Extract font URL from CSS string

function extractFontUrl(cssString, fontName) {
  // Regular expression to match URLs with .ttf extension within the CSS string
  // const urlRegex = /https:[^}]*\.ttf/;
  const urlRegex = /https:[^}]*\.(ttf|otf)/;
  const capturedUrl = cssString.match(urlRegex);
  if (capturedUrl) {
    // If a .ttf URL is found, download the font
    downloadFont(capturedUrl[0], fontName);
  } else {
    console.error('No .ttf or .otf font URL found!');
    return null;
  }
}

// Download font from URL and save locally

function downloadFont(url, fontName) {
  // Construct the filename using fontName with .ttf extension
  const extensionRegex = /\.ttf|\.otf$/;
  const capturedExtension = url.match(extensionRegex);
  const filename = fontName + capturedExtension;
  https
    .get(url, response => {
      if (response.statusCode === 200) {
        // Handle successful response (status code 200)
        const fileStream = fs.createWriteStream(filename);
        response.pipe(fileStream);
        console.log(`Downloading ${filename}...`);

        fileStream.on('finish', () => {
          console.log(`${filename} downloaded successfully!`);

          // Call another function (likely copyFile) to process the downloaded font
          copyFile(filename);
        });
      } else {
        console.error(`Error downloading file: ${response.statusCode}`);
      }
    })
    .on('error', error => {
      console.error(`Error: ${error.message}`);
    });
}

// Copy downloaded font to target directories (atomic with overwrite prevention)

function copyFile(filename) {
  const sourcePath = filename;

  // Define target paths with path.join
  const targetPath1 = path.join(appDirectory, filename);
  const targetPath2 = path.join(webDirectory, filename);

  // Use fs.copyFileSync with COPYFILE_EXCL for atomic copy with overwrite prevention
  fs.copyFileSync(sourcePath, targetPath1, fs.constants.COPYFILE_EXCL, err => {
    if (err) {
      console.error(`Error moving file to ${appDirectory}: ${err.message}`);
    } else {
      console.log(`File moved to ${appDirectory}`);
    }
  });

  fs.copyFileSync(sourcePath, targetPath2, fs.constants.COPYFILE_EXCL, err => {
    if (err) {
      console.error(`Error moving file to ${webDirectory}: ${err.message}`);
    } else {
      console.log(`File moving to ${webDirectory}`);
    }
  });

  // Delete the original file from the root folder (assuming success)
  fs.unlinkSync(sourcePath);
}

// Parse options from command line arguments
const options = process.argv[2];

// Handle different options
if (options.includes('url')) {
  // Handle URL-based font option (arguments at process.argv[3] and 4)
  handleUrlOption(process.argv[3], process.argv[4]);
} else if (options.includes('local')) {
  // Handle local font option (argument at process.argv[3])
  handleLocalOption(process.argv[3]);
} else if (options.includes('string')) {
  // Handle font provided as a string
  if (!process.argv[3]) {
    throw new Error(
      'Missing font family arguments. Please provide font family name.',
    );
  } else {
    var i = 3;
    var fontFamilyUrl = `https://fonts.googleapis.com/css2?family=${process.argv[i]}`;
    var fileName = process.argv[i];
    while (process.argv[++i]) {
      fontFamilyUrl += `+${process.argv[i]}`;
      fileName += process.argv[i];
    }
    handleStringOption(fontFamilyUrl, fileName);
  }
} else {
  // Print error message for invalid options
  console.error('Invalid option. Please use one of: -url, -local, or -string');
}
