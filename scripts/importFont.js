const process = require('process');
const fs = require('fs');
const https = require('https');
const path = require('path');
const targetDir1 = 'assets/fonts';
const targetDir2 = 'src/public/assets/fonts';

// Ensure target directories exist or not, if not found  then create it.
for (const targetDir of [targetDir1, targetDir2]) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {recursive: true});
  }
}

//If handle Url is called it just calls the function
function handleUrlOption(url, fontName) {
  extractFontUrl(url, fontName);
}

function handleLocalOption(filename) {
  copyFile(filename);
}

function handleStringOption(url, fontName) {
  https
    .get(url, response => {
      let responseData = '';
      response.on('data', chunk => {
        responseData += chunk;
      });

      response.on('end', () => {
        extractFontUrl(responseData, fontName);
      });
    })
    .on('error', error => {
      console.error('Error fetching URL:', error);
    });
}

function extractFontUrl(cssString, fontName) {
  const urlRegex = /https:[^}]*\.ttf/; // Regex to match URL with .ttf extension
  const capturedUrl = cssString.match(urlRegex);

  if (capturedUrl) {
    downloadFont(capturedUrl[0], fontName); // Return the captured URL (without quotes)
  } else {
    console.error('No .ttf font URL found!');
    return null;
  }
}

function downloadFont(url, fontName) {
  const filename = fontName + '.ttf';
  https
    .get(url, response => {
      if (response.statusCode === 200) {
        const fileStream = fs.createWriteStream(filename);
        response.pipe(fileStream);
        console.log(`Downloading ${filename}...`);

        fileStream.on('finish', () => {
          console.log(`${filename} downloaded successfully!`);

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

function copyFile(filename) {
  const sourceFile = filename;
  fs.copyFileSync(
    sourceFile,
    path.join(targetDir1, filename),
    fs.constants.COPYFILE_EXCL,
    err => {
      if (err) {
        console.error(`Error moving file to ${targetDir1}: ${err.message}`);
      } else {
        console.log(`File moved to ${targetDir1}`);
      }
    },
  );

  fs.copyFileSync(
    sourceFile,
    path.join(targetDir2, filename),
    fs.constants.COPYFILE_EXCL,
    err => {
      if (err) {
        console.error(`Error copying file to ${targetDir2}: ${err.message}`);
      } else {
        console.log(`File copied to ${targetDir2}`);
      }
    },
  );

  fs.unlinkSync(sourceFile); // Delete the original file from the root folder
}

const options = process.argv[2];

if (options.includes('url')) {
  handleUrlOption(process.argv[3], process.argv[4]);
} else if (options.includes('local')) {
  handleLocalOption(process.argv[3]);
} else if (options.includes('string')) {
  const fontFamilyUrl =
    'https://fonts.googleapis.com/css2?family=' + process.argv[3];
  handleStringOption(fontFamilyUrl, process.argv[3]);
} else {
  console.error('Invalid option. Please use one of: -url, -local, or -string');
}
