class TableSorter {
    constructor(page) {
        this.page = page;
    }

    async checkSorting(columnName, exactMatch = false) {
        try {
            console.log(`🔍 Checking sorting for column: ${columnName}`);

            const columnLocator = exactMatch
                ? this.page.getByRole('cell', { name: columnName, exact: true }) 
                : this.page.getByRole('cell', { name: columnName });

            const elements = await columnLocator.count();
            if (elements > 1) {
                console.warn(`⚠ Multiple elements found for "${columnName}". Trying the first one.`);
            } else if (elements === 0) {
                console.error(`❌ No matching element found for "${columnName}".`);
                return false;
            }

            // Get column index dynamically
            const columnIndex = await columnLocator.first().evaluate((el) => 
                Array.from(el.parentElement.children).indexOf(el)
            );

            // Click column header before capturing data
            await Promise.all([
                columnLocator.first().click({ timeout: 5000 }), // Click column header
                this.page.waitForTimeout(1500) // Small delay for sorting to apply
            ]);

            // Get column values after sorting
            const columnDataLocator = this.page.locator(`#agents-table tbody tr td:nth-child(${columnIndex + 1})`);
            await this.page.waitForSelector(`#agents-table tbody tr td:nth-child(${columnIndex + 1})`, { state: 'visible' });

            let sortedValues = await columnDataLocator.evaluateAll(nodes =>
                nodes.map(node => {
                    let inputField = node.querySelector('input');
                    return inputField ? inputField.value.trim() : node.textContent.trim();
                })
            );

            console.log(`📋 Sorted values for "${columnName}": ${sortedValues.join(' | ')}`);

            // **Check if column is a date field**
            const isDateColumn = sortedValues.every(value => this.isValidDate(value));

            let expectedAscending;
            if (isDateColumn) {
                expectedAscending = [...sortedValues].sort((a, b) => this.compareDates(a, b));
            } else {
                expectedAscending = [...sortedValues].sort((a, b) =>
                    a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
                );
            }

            let expectedDescending = [...expectedAscending].reverse();

            // 🛠️ **Sorting Validation**
            if (JSON.stringify(sortedValues) === JSON.stringify(expectedAscending)) {
                console.log(`✅ CONFIRMED SORTING: ASCENDING`);
            } else if (JSON.stringify(sortedValues) === JSON.stringify(expectedDescending)) {
                console.log(`✅ CONFIRMED SORTING: DESCENDING`);
            } else {
                console.error(`❌ Sorting failed: Unexpected order.`);
                console.log(`🔎 Expected: ${expectedAscending.join(' | ')}`);
                console.log(`🔎 Actual:   ${sortedValues.join(' | ')}`);
                return false;
            }

            console.log(`✅ Sorting verified for: ${columnName}`);
            return true;
        } catch (error) {
            console.error(`❌ Error sorting column "${columnName}":`, error);
            return false;
        }
    }

    /**
     * 🗓 Helper function to check if a value is a valid date (supports MM/DD/YYYY format).
     */
    isValidDate(value) {
        return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
    }

    /**
     * 📅 Compare dates in MM/DD/YYYY format correctly.
     */
    compareDates(a, b) {
        const dateA = this.convertToISO(a);
        const dateB = this.convertToISO(b);
        return dateA - dateB;
    }

    /**
     * 🔄 Converts MM/DD/YYYY to YYYY-MM-DD format for proper sorting.
     */
    convertToISO(dateString) {
        const [month, day, year] = dateString.split('/').map(Number);
        return new Date(`${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }
}

module.exports = TableSorter;
