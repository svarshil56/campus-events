import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file.
 * @param {Array<Object>} data - Array of objects to export.
 * @param {string} fileName - Name of the file to save (without extension).
 * @param {string} sheetName - Name of the worksheet.
 */
export const exportToExcel = (data, fileName = 'export', sheetName = 'Sheet1') => {
    // 1. Convert JSON to Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create Workbook and append Worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // 3. Write file
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
