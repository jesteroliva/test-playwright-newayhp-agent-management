const { expect } = require('@playwright/test');
const { siteloads } = require('../../PageObjects/new ayhp/siteloads'); // Add this import line


class DashboardPage {
  constructor(page) {
    this.page = page; // Store the page object
    // Define the selectors for elements you interact with on the dashboard page
    this.logoLink = page.locator('role=link[name="AyHP"]'); // Example: Logo link
    this.siteLoads = new siteloads(page); // Add this line inside the constructor

   
  }

  // Method to check if the logo link is visible on the dashboard
  async isLogoVisible() {
    await expect(this.logoLink).toBeVisible(); // Check if the logo link is visible
    await this.siteLoads.isLogoVisible(); // Add this method to call siteloads' isLogoVisible
    await this.siteLoads.isAgentManagementContentVisible();
    await this.siteLoads.checkAgentManagementFunctionality();
  }



    async checkLogoVisibility() {
      await this.siteLoads.isLogoVisible(); // Add this method to call siteloads' isLogoVisible
      await this.siteLoads.isAgentManagementContentVisible();
      await this.siteLoads.checkAgentManagementFunctionality();
    }
  
  }
    
//}

module.exports = { DashboardPage }; // Export the DashboardPage class for use in the test
