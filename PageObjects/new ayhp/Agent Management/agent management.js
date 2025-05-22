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
      
        const columnBaseNames = [
          'AGENT ID',
          'AGENCY',
          'FIRST NAME',
          'MIDDLE NAME',
          'LAST NAME',
          'STATE',
          'ORIG. AGENCY',
          'BUSINESS FROM',
          'BUSINESS TYPE',
          'STATUS',
          'COMPANY'
        ];
      
        // Helper inside this method for simplicity
        function isValidDate(value) {
          return !isNaN(Date.parse(value));
        }
      
        function compareDates(a, b) {
          return new Date(a) - new Date(b);
        }
      
        for (const baseName of columnBaseNames) {
          try {
            console.log(`\n🔍 Checking sorting for column: ${baseName}`);
      
            const headerLocator = this.page.locator('th[aria-label]').filter({ hasText: baseName });
            const count = await headerLocator.count();
            if (count === 0) {
              console.warn(`⚠ Column header not found for: ${baseName}`);
              continue;
            }
      
            const columnIndex = await headerLocator.first().evaluate(el =>
              Array.from(el.parentElement.children).indexOf(el)
            );
      
            for (let clickNum = 1; clickNum <= 2; clickNum++) {
              console.log(`➡️ Clicking header "${baseName}" for sort #${clickNum}`);
              await headerLocator.first().click();
              await this.page.waitForTimeout(1500);
      
              const columnCells = this.page.locator(`#agents-table tbody tr td:nth-child(${columnIndex + 1})`);
              await columnCells.first().waitFor({ state: 'visible' });
      
              const values = await columnCells.evaluateAll(nodes =>
                nodes.map(node => {
                  const input = node.querySelector('input');
                  return input ? input.value.trim() : node.textContent.trim();
                })
              );
      
              console.log(`📋 Values after click #${clickNum} on "${baseName}":`, values.join(' | '));
      
              // SORTING VALIDATION
              const isDateColumn = values.every(isValidDate);
              let sortedAsc;
              if (isDateColumn) {
                sortedAsc = [...values].sort(compareDates);
              } else {
                sortedAsc = [...values].sort((a, b) =>
                  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
                );
              }
      
              let sortedDesc = [...sortedAsc].reverse();
      
              if (clickNum === 1) { // first click: expect ascending
                if (JSON.stringify(values) === JSON.stringify(sortedAsc)) {
                  console.log(`✅ "${baseName}" is correctly sorted ASCENDING after click #1`);
                } else {
                  console.error(`❌ "${baseName}" sorting ASCENDING failed!`);
                }
              } else if (clickNum === 2) { // second click: expect descending
                if (JSON.stringify(values) === JSON.stringify(sortedDesc)) {
                  console.log(`✅ "${baseName}" is correctly sorted DESCENDING after click #2`);
                } else {
                  console.error(`❌ "${baseName}" sorting DESCENDING failed!`);
                }
              }
            }
          } catch (err) {
            console.error(`❌ Error checking sorting for column "${baseName}":`, err);
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