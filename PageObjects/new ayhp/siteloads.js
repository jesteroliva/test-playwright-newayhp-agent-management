const { expect } = require('@playwright/test');
const { agentManagement } = require('../../PageObjects/new ayhp/Agent Management/agent management');

class siteloads {
  constructor(page) {
    this.page = page; // Store the page object
    // Define the selectors for elements you interact with on the dashboard page
    this.logoLink = page.locator('role=link[name="AyHP"]'); // Example: Logo link
    this.agentManagement = new agentManagement(page); // Initialize agentManagement class here
  }

  // Method to check if the logo link is visible on the dashboard
  async isLogoVisible() {
    await expect(this.logoLink).toBeVisible(); // Check if the logo link is visible
  }


  // Call agent management functions for checking visibility and functionality
  async isAgentManagementContentVisible() {
    // Call the isContentVisible method from the agentManagement class
    await this.agentManagement.isContentVisible();
  }

  async checkAgentManagementFunctionality() {
    await this.agentManagement.functionalityChecks();
    await this.agentManagement.applyFiltersAndVerify();
    await this.agentManagement.exportFunc();
   
  }
}

module.exports = { siteloads }; // Export the siteloads class for use in the test
