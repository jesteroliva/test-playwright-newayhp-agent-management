// DownloadValidation.js
const { expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

class DownloadValidation {
  constructor(page) {
    this.page = page;
  }

  // Method to check the visibility of specific links
  async checkLinksVisibility() {
    try {
      await expect(this.page.locator('role=link[name="AyHP"]').first()).toBeVisible({ timeout: 5000 });
      await expect(this.page.locator('role=link[name="Super Administrator"]')).toBeVisible();
      console.log("Success: Both links are visible");
    } catch (error) {
      console.error("Failed: One or more links are not visible");
      throw error;
    }
  }

  // Method to check if the download exists by saving it to a local path
  async checkDownloadExistence(downloadPromise) {
    const download = await downloadPromise; // Wait for the download event
    
    // Get the default filename suggested by the website
    const defaultFilename = download.suggestedFilename();
    
    // Specify the base download path and create 'case management' folder if it doesn't exist
    const baseDownloadPath = 'C:\\Users\\joliva\\Desktop\\new ayhp automation download\\case management\\';

    // Check if the 'case management' folder exists; if not, create it
    if (!fs.existsSync(baseDownloadPath)) {
      fs.mkdirSync(baseDownloadPath, { recursive: true });
      console.log(`Folder created at: ${baseDownloadPath}`);
    }

    // Check if file already exists in the directory
    let downloadPath = path.join(baseDownloadPath, defaultFilename);
    
    // If file exists, modify the filename to add (1)
    let counter = 1;
    while (fs.existsSync(downloadPath)) {
      const fileNameWithoutExt = path.parse(defaultFilename).name;
      const fileExt = path.parse(defaultFilename).ext;
      downloadPath = path.join(baseDownloadPath, `${fileNameWithoutExt}(${counter})${fileExt}`);
      counter++;
    }

    try {
      // Save the downloaded file to the specified path
      await download.saveAs(downloadPath);
      console.log('Download saved to:', downloadPath); // Log the download path
      
      // Verify that the download path is not empty (file should exist)
      expect(downloadPath).toBeTruthy();

      // Now check if the file actually exists in the directory
      if (fs.existsSync(downloadPath)) {
        console.log(`File ${path.basename(downloadPath)} successfully downloaded and exists at ${downloadPath}`);
      } else {
        console.error(`File ${path.basename(downloadPath)} does not exist at ${downloadPath}`);
        throw new Error(`File download verification failed for ${downloadPath}`);
      }
    } catch (error) {
      console.error("Failed to save download:", error);
      throw error;
    }
  }
}

module.exports = { DownloadValidation };
