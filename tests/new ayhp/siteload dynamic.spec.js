// siteload dynamic (test file)
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../PageObjects/new ayhp/loginPage');
const { DashboardPage } = require('../../PageObjects/new ayhp/dashboardPage'); 
const config = require('../../PageObjects/new ayhp/config'); // Import the config file
//new ayhp
//CFC upgrade


test('test', async ({ page }) => {
 const loginPage = new LoginPage(page, config); // Pass config to LoginPage constructor
 const dashboardPage = new DashboardPage(page);

   // Navigate to the login page
   await page.goto(config.websiteURL); // Use URL from config
   await page.waitForTimeout(2000); // Wait for 2 seconds
 
   // Perform login using credentials from config
   await loginPage.login();
   //console.log("Success");

  
  try {
    // Check if "Logo" link is visible
    await page.waitForTimeout(2000);
    await dashboardPage.isLogoVisible();
    
    // Perform navigation to "Expired Licenses"
   // await loginPage.navigateToExpiredLicenses();
    
    // Check if the data table is visible
   // await loginPage.isDataTableVisible();
    //console.log("Success");
  } catch (error) {
    // If the "Logo" link is not visible, fail the test
    console.error("Failed: Logo link is not visible");
    throw error; // Re-throw the error to fail the test
  }

  // Check if the additional section is visible
  //await loginPage.isAdditionalSectionVisible();
  

});

//  Define `afterAll` outside the `test` function
test.afterAll(async ({ browser }) => {
  await browser.close();
  console.log("Browser closed.");
});
