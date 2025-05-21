class DynamicFilter {
    constructor(page, options = {}) {
        this.page = page;
       this.tableSelector = options.tableSelector || '#agents-table tbody';
       //carrier-exception-table
        //this.tableSelector = options.tableSelector || '#carrier-file-table tbody';  
        //this.tableSelector = options.tableSelector || '#carrier-exception-table tbody';
        this.dropdownSelector = options.dropdownSelector || 'role=combobox';
        this.optionSelector = options.optionSelector || 'role=option';
        this.checkboxSelector = options.checkboxSelector || 'role=checkbox';
        this.radioButtonSelector = options.radioButtonSelector || 'role=radio';
        this.inputSelector = options.inputSelector || 'role=textbox';
        this.resultsTable = this.page.locator(this.tableSelector); // Table to check filtered results
        this.storedExpectedTexts = [];
    }

    // Method to apply filter and verify
    async applyFilterAndVerify(filterName, filterType, filterValue, expectedText) {
        try {
            await this.applyFilter(filterName, filterType, filterValue);
            await this.waitForResultsUpdate();

            const isFilterWorking = await this.verifyFilteredResults();
            if (!isFilterWorking) {
                throw new Error('Filter is not working as expected.');
            }
        } catch (error) {
            throw new Error(`Failed to apply or verify filter: ${error.message}`);
        }
    }

    // Apply filter based on its type
    async applyFilter(filterName, filterType, filterValue) {
        switch (filterType) {
            case 'checkbox': return await this.applyCheckboxFilter(filterName);
            case 'radio': return await this.applyRadioFilter(filterName);
            case 'select': return await this.applySelectFilter(filterName, filterValue);
            case 'input': return await this.applyInputFilter(filterName, filterValue);
            default: throw new Error(`Unknown filter type: ${filterType}`);
        }
    }

    // Apply a checkbox filter
    async applyCheckboxFilter(filterName) {
        const checkbox = this.page.locator(`${this.checkboxSelector}[name="${filterName}"]`);
        await checkbox.check();
    }

    // Apply a radio button filter
    async applyRadioFilter(filterName) {
        const radioButton = this.page.locator(`${this.radioButtonSelector}[name="${filterName}"]`);
        await radioButton.check();
    }

    // Apply a select dropdown filter
    async applySelectFilter(filterName, filterValue, expectedText) {
        const dropdown = this.page.locator(`${this.dropdownSelector}[name="${filterName}"]`);
         console.log(dropdown);
        
        // Click on the dropdown
        await dropdown.click();
        
        // Select the filter option
        await this.page.locator(`${this.optionSelector}[name="${filterValue}"]`).click();
        
        // Store the expected text in the array
        this.storedExpectedTexts.push(expectedText); 
        console.log(`Stored expected text for select filter: ${expectedText}`);
    }

    async applySelectFilter2(filterName, filterValue, expectedText) {
        // Click on the Select2 dropdown
        const dropdown = this.page.locator(`#select2-${filterName}-container`);
        await dropdown.click();
    
        // Type the filter value in the search box (if Select2 is searchable)
        const searchBox = this.page.locator('.select2-search__field');
        await searchBox.fill(filterValue);
    
        // Wait for the option to appear and click it
        const option = this.page.locator(`li.select2-results__option`, { hasText: filterValue });
        await option.click();
    
        // Store expected text
        this.storedExpectedTexts.push(expectedText);
        console.log(`Stored expected text for select filter: ${expectedText}`);
    }

   
    // Apply a text input filter
    async applyInputFilter(filterName, filterValue, expectedText) { 
        const inputField = this.page.locator(`${this.inputSelector}[name="${filterName}"]`);
        
        // Fill the input field and press 'Enter'
        await inputField.fill(filterValue);
        await inputField.press('Enter');
        
        // Wait for the page to process the filter
        await this.page.waitForTimeout(5000);
    
        // Store the expected text in the array
        this.storedExpectedTexts.push(expectedText); 
        console.log(`Stored expected text for input filter: ${expectedText}`);
    }

    // Wait for results to update
    async waitForResultsUpdate() {
        await this.page.waitForTimeout(1000);
    }

    // Verify the filtered results based on stored expected texts
    async verifyFilteredResults(expectedTextsMap) {
        const rows = await this.resultsTable.locator('tr').count();
        console.log(`\n🔍 Debug: Found ${rows} rows in the results table.\n`);
    
        if (rows === 0) {
            console.warn('⚠ No visible rows in the table!\n');
            return false;
        }
    
        let allRowsValid = true;
    
        for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
            const row = this.resultsTable.locator(`tr:nth-child(${rowIndex + 1})`);
    
            // Extract only text from table cells, excluding buttons
            const rowTextArray = await row.locator('td').evaluateAll(cells =>
                cells
                    .map(cell => cell.innerText.trim())  // Get text and trim spaces
                    .filter(text => text && !text.includes("Open File")) // Remove empty and unwanted text
            );
    
            const rowText = rowTextArray.join(' | ');
    
            console.log(`\n------------------`);
            console.log(`Row ${rowIndex + 1}: ${rowText}`);
            console.log(`------------------\n`);
    
            let allExpectedTextsFound = true;
    
            for (const expectedText of expectedTextsMap) {
                console.log(`🔎 Checking for expected text: "${expectedText}" in Row ${rowIndex + 1}`);
    
                const regex = new RegExp(`\\b${expectedText}\\b`, 'i');
    
                if (regex.test(rowText)) {
                    console.log(`✅ Found '${expectedText}' in Row ${rowIndex + 1}\n`);
                } else {
                    console.warn(`❌ Not Found '${expectedText}' in Row ${rowIndex + 1}\n`);
                    allExpectedTextsFound = false;
                }
            }
    
            if (!allExpectedTextsFound) {
                console.warn(`⚠ Test failed: Missing expected text(s) in Row ${rowIndex + 1}.\n`);
                allRowsValid = false;
            }
        }
    
        return allRowsValid;
    }
    
    
}

module.exports = { DynamicFilter };