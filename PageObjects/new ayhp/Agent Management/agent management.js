const { expect } = require('@playwright/test');
const DownloadChecker = require('../../../tests/new ayhp/download 2'); 
const TableSorter = require('../../../tests/new ayhp/tablesorting'); 
const { DynamicFilter } = require('../../../tests/new ayhp/filters dynamic');  // Correct import path

class agentManagement {
    constructor(page) {
        this.page = page; // Store the page object
        // Define the selectors for elements you interact with on the dashboard page
        this.logoLink = this.page.locator('role=link[name="AyHP"]'); // Example: Logo link
        this.downloadChecker = new DownloadChecker(); 
        this.sorter = new TableSorter(page); 
        this.dynamicFilter = new DynamicFilter(page); // Instantiate DynamicFilter class here
        this.resultsTable = this.page.locator('#agents-table tbody'); // Adjust selector as needed
    }

    async agentmanagementClick() {
        await this.page.locator('role=link[name=" Agent Lookup"]').first().click();
        await this.page.waitForTimeout(5000); 
    }

    async isContentVisible() {
        await this.page.locator('role=link[name=" Agent Lookup"]').first().click();
        await expect(this.logoLink).toBeVisible(); // Check if the logo link is visible
        await expect(this.page.locator('.content')).toBeVisible();
        await expect(this.page.locator('#search-filter-form')).toBeVisible();
        await expect(this.page.getByRole('searchbox', { name: 'Impersonate a user' }).first()).toBeVisible();
       // await expect(this.page.getByRole('link', { name: 'Super Administrator' })).toBeVisible();
      //  await expect(this.page.getByRole('link', { name: ' Dashboard' })).toBeVisible();
        await this.page.waitForTimeout(5000); 
    }

    async functionalityChecks() {
        console.log('🔍 Initiating sorting verification...');
        await this.page.getByRole('button', { name: 'Search' }).click();
    
        const columnsToSort = [
            { name: 'AGENT ID: activate to sort column ascending', exact: false },
            { name: 'AGENCY: activate to sort column ascending', exact: true },
            { name: 'FIRST NAME: activate to sort column ascending', exact: true },
            { name: 'MIDDLE NAME: activate to sort column ascending', exact: true },
            { name: 'LAST NAME: activate to sort column ascending', exact: true },
            { name: 'STATE: activate to sort column ascending', exact: true },
            { name: 'ORIG. AGENCY: activate to sort column ascending', exact: false },
            { name: 'BUSINESS FROM: activate to sort column ascending', exact: false },
            { name: 'BUSINESS TYPE: activate to sort column ascending', exact: false },
            { name: 'STATUS: activate to sort column ascending', exact: true },
            { name: 'COMPANY: activate to sort column ascending', exact: true }
        ];
    
        for (const column of columnsToSort) {
            try {
                console.log(`🔍 Checking sorting for column: ${column.name}`);
    
                const columnExists = await this.page.$(`th[aria-label="${column.name}"]`);
                if (!columnExists) {
                    console.error(`❌ Column ${column.name} not found.`);
                    continue; // Skip to next column
                }
    
                await this.page.waitForSelector(`th[aria-label="${column.name}"]`, { state: 'visible' });
                await this.page.waitForLoadState('domcontentloaded');
    
                const isSorted = await Promise.race([
                    this.sorter.checkSorting(column.name, column.exact),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Sorting check timeout')), 5000))
                ]);
    
                if (!isSorted) {
                    console.error(`❌ Sorting failed for ${column.name}`);
                } else {
                    console.log(`✅ Sorting verified for ${column.name}`);
                }
            } catch (error) {
                console.error(`❌ Error checking sorting for ${column.name}: ${error.message}`);
            }
        }
    }
    
    
    
    //async applyFiltersAndVerify() {
       // const filters = [
        //  ['--------', 'ACSIA', 'ACSIA'],
         //  ['First Name:','Kinny', 'Kinny']
          //  ['agency', 'XYZ Corp', 'XYZ Corp'],
        //   ['category', 'Retail', 'Retail']
      // ];
    
      // for (const filter of filters) {
          // await this.dynamicFilter.applyDropdownFilterAndVerify(...filter);
      //  }
     
    //} 
    async applyFiltersAndVerify() {
        const filters = [
            ['--------', 'select', 'ACSIA', 'ACSIA']
        ];
    
        for (const filter of filters) {
            const [filterName, filterType, filterValue, expectedText] = filter;
            console.log(`Applying filter: ${filterName} (${filterType}) = ${filterValue}`);
    
            try {
                if (filterType === 'select') {
                    await this.dynamicFilter.applySelectFilter(filterName, filterValue, expectedText);
                } else if (filterType === 'input') {
                    await this.dynamicFilter.applyInputFilter(filterName, filterValue, expectedText);
                } else if (filterType === 'checkbox') {
                    await this.dynamicFilter.applyCheckboxFilter(filterName, filterValue);
                } else if (filterType === 'radio') {
                    await this.dynamicFilter.applyRadioFilter(filterName, filterValue);
                } else {
                    console.error(`Unknown filter type: ${filterType}`);
                }
    
                console.log(`✅ Filter applied successfully: ${filterName}`);
            } catch (error) {
                console.error(`❌ Error applying filter: ${filterName}`, error);
            }
        }
    
        console.log('⌛ Filters applied, now clicking Search...');
        
        // Capture table content before clicking search
        const tableBefore = await this.page.locator('#agents-table tbody').innerText();
    
        await this.page.getByRole('button', { name: 'Search' }).click({ force: true });
    
        console.log('⌛ Waiting for table to update...');
    
        // ✅ Wait for table to change after clicking "Search"
        await this.page.waitForFunction((oldTableContent) => {
            const newTableContent = document.querySelector('#agents-table tbody')?.innerText;
            return newTableContent && newTableContent !== oldTableContent;
        }, tableBefore, { timeout: 20000 });
        // ✅ Now, log the updated rows
        const rows = await this.page.locator('#agents-table tbody tr');
        const rowCount = await rows.count();
    
        console[rowCount ? 'log' : 'warn'](
            rowCount ? `✅ Found ${rowCount} results. Logging row contents:` 
                : '⚠ No results found after applying filters!'
        );
    
        for (let i = 0; i < rowCount; i++) {
            const rowText = (await rows.nth(i).locator('td').allTextContents())
                .map(text => text.trim()).join(' | ');
            console.log(`Row ${i + 1}: ${rowText}`);
        }
    
        // ✅ After logging, verify filtered results
        const expectedTexts = filters.map(filter => filter[3]); 
        const verificationResult = await this.dynamicFilter.verifyFilteredResults(expectedTexts);
    
        if (!verificationResult) {
            console.error('❌ Verification failed: Some expected values were not found in the results.');
        } else {
            console.log('✅ Verification passed: All expected values were found.');
        }
    
       // console.log("⌛ Now checking sorting...");
        //await this.sorter.checkSorting();
    }
    
    
    
  async exportFunc() {
    console.log("⌛ Exporting...");

    await this.page.waitForSelector('button:has-text("Export")', { timeout: 10000 });
    console.log("✅ Export button found, clicking...");

    const downloadPromise = this.page.waitForEvent('download'); // Increased timeout

    await this.page.getByRole('button', { name: 'Export' }).click();
    console.log("⌛ Waiting for download...");

    try {
        await new DownloadChecker().checkDownloadExistence(downloadPromise);
    } catch (error) {
        console.error("❌ Download failed:", error);
    }
}
    
async getColumnData(columnIndex) {
    const columnDataLocator = this.page.locator(`#agents-table tbody tr td:nth-child(${columnIndex + 1})`);
    await this.page.waitForSelector(`#agents-table tbody tr td:nth-child(${columnIndex + 1})`, { state: 'visible' });
    return columnDataLocator.allTextContents();
}
    
}

module.exports = { agentManagement };