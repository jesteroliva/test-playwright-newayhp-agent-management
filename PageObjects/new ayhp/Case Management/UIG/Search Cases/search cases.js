const { expect } = require('@playwright/test');
const DownloadChecker = require('../../../tests/dynamic testing/download 2'); 
const TableSorter = require('../../../tests/dynamic testing/tablesorting'); 
const { DynamicFilter } = require('../../../tests/dynamic testing/filters dynamic');  // Correct import path

class searchCases {
    constructor(page) {
        this.page = page; // Store the page object
        // Define the selectors for elements you interact with on the dashboard page
        this.logoLink = this.page.locator('role=link[name="AyHP"]'); // Example: Logo link
        this.downloadChecker = new DownloadChecker(); 
        this.sorter = new TableSorter(page); 
        this.dynamicFilter = new DynamicFilter(page); // Instantiate DynamicFilter class here
        this.resultsTable = this.page.locator('#agents-table tbody'); // Adjust selector as needed
    }
    async UigSearchCaseClick() {
        await this.page.locator('role=link[name=" Search Cases"]').first().click();
        await this.page.waitForTimeout(5000); 
    }
    

}
module.exports = { searchCases};

