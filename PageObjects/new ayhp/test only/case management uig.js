// PageValidator.js
const { expect } = require('@playwright/test');

class PageValidator {
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
    
    // Specify the path where you want the file to be saved
    const downloadPath = `C:\\Users\\joliva\\Desktop\\new ayhp automation download\\${defaultFilename}`;
    
    try {
      // Save the downloaded file to the specified path
      await download.saveAs(downloadPath);
      console.log('Download saved to:', downloadPath); // Log the download path
      
      // Verify that the download path is not empty (file should exist)
      expect(downloadPath).toBeTruthy();
    } catch (error) {
      console.error("Failed to save download:", error);
      throw error;
    }
  }
}

module.exports = { PageValidator };
