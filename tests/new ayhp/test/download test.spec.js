const { expect } = require('@playwright/test');  // Import expect

// downloadTest.spec.js
const { test } = require('@playwright/test');
const { LoginPage } = require('../../../PageObjects/new ayhp/loginPage.js'); // Import LoginPage
const { DashboardPage } = require('../../../PageObjects/new ayhp/dashboardPage.js'); // Import DashboardPage
const { DownloadValidation } = require('../../../PageObjects/new ayhp/test only/downloadValidation.js'); // Import PageValidator
const config = require('../../../PageObjects/new ayhp/config.js'); // Import the config file

test('test', async ({ page }) => {
  // Instantiate the Page Objects
  const loginPage = new LoginPage(page, config); // Pass config to LoginPage constructor
  const dashboardPage = new DashboardPage(page);
  const validator = new DownloadValidation(page);
    //step 1: login
    await page.goto(config.websiteURL); // Use URL from config
  await page.waitForTimeout(2000); // Wait for 2 seconds

  // Perform login using credentials from config
  await loginPage.login();
  console.log("Success");
    
    // Step 2: Validate visibility of important links
    await validator.checkLinksVisibility();
  
    // Step 3: Navigate, search and apply filters
   await dashboardPage.searchAndApplyFilters();
   await page.waitForTimeout(6000);

   // Additional step: APPLY FILTER
   await dashboardPage.applyFilter();
   
   //await expect(page.getByText('Apply Filters')).toBeVisible()
   //await page.getByText('Apply Filters').click();
   
   //await page.waitForTimeout(6000);
   
  
    // Step 4: Click on the record
    const recordLocator = page.locator('[id="\\36 345"]'); // Assuming this is the correct ID or selector for the record
    await recordLocator.locator('role=cell').filter({ hasText: /^$/ }).first().click(); // Click on the specific record
  
  // xtra step
 // await page.getByRole('button', { name: 'Case Action' }).click();

    // Step 5: Export cases
    await dashboardPage.exportCases();
  
    // Step 6: Wait for download event and verify download
    const downloadPromise = page.waitForEvent('download');
    await page.locator('role=link[name="here"]').click(); // Assuming this triggers the download
  
    // Step 7: Check download existence
    await validator.checkDownloadExistence(downloadPromise); // Verify the download

    
   
});
