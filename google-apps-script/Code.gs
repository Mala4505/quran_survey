/**
 * Google Apps Script — Quran Status Update Sync Endpoint
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a Google Sheet with columns: EjamaatID, Full_Name, FLOOR, ROW, SEAT, Quran_Sanad, Talim
 * 2. Open Extensions > Apps Script
 * 3. Paste this entire code into Code.gs
 * 4. Click Deploy > New Deployment > Web App
 * 5. Set "Execute as" = Me, "Who has access" = Anyone
 * 6. Copy the Web App URL
 * 7. Paste the URL into src/config.ts as the APPS_SCRIPT_URL value
 */

// ============ CONFIGURATION ============
// Name of the sheet tab (default is "Sheet1")
const SHEET_NAME = 'MASTER';

// Column mapping (1-indexed) based on user's sheet:
// EjamaatID, Age, MARKAZ, CATG, ROW, SEAT, Full_Name, Quran_Sanad, Talim, Contact_No, Is_Updated
const COLS = {
  EjamaatID: 1,
  ROW: 5,
  SEAT: 6,
  Full_Name: 7,
  Quran_Sanad: 8,
  Talim: 9,
  Contact_No: 10,
  Is_Updated: 11
};

// ============ GET: Return full dataset ============
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    const people = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty rows
      
      people.push({
        EjamaatID: Number(row[COLS.EjamaatID - 1]),
        Full_Name: String(row[COLS.Full_Name - 1] || ''),
        ROW: String(row[COLS.ROW - 1] || ''),
        SEAT: String(row[COLS.SEAT - 1] || ''),
        Quran_Sanad: String(row[COLS.Quran_Sanad - 1] || ''),
        Talim: String(row[COLS.Talim - 1] || ''),
        Contact_No: String(row[COLS.Contact_No - 1] || ''),
        Is_Updated: !!row[COLS.Is_Updated - 1],
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, people: people, count: people.length }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============ POST: Batch update records ============
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const itsNumber = body.itsNumber;
    const updates = body.updates;
    
    if (!itsNumber || !updates || !Array.isArray(updates)) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid request body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    
    // Validate that the requesting ITS exists in the sheet
    const allITS = data.slice(1).map(row => Number(row[COLS.EjamaatID - 1]));
    if (!allITS.includes(Number(itsNumber))) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Unauthorized ITS number' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Build lookup: EjamaatID -> row index (1-indexed for Sheets)
    const rowIndex = {};
    for (let i = 1; i < data.length; i++) {
      const id = Number(data[i][COLS.EjamaatID - 1]);
      if (id) rowIndex[id] = i + 1; // +1 because Sheets rows are 1-indexed
    }
    
    let updatedCount = 0;
    
    for (const update of updates) {
      const targetRow = rowIndex[Number(update.EjamaatID)];
      if (!targetRow) continue;
      
      // Update Quran_Sanad
      if (update.Quran_Sanad !== undefined) {
        sheet.getRange(targetRow, COLS.Quran_Sanad).setValue(update.Quran_Sanad);
      }
      
      // Update Talim
      if (update.Talim !== undefined) {
        sheet.getRange(targetRow, COLS.Talim).setValue(update.Talim);
      }
      
      // Update Contact_No
      if (update.Contact_No !== undefined) {
        sheet.getRange(targetRow, COLS.Contact_No).setValue(update.Contact_No);
      }
      
      // Update Is_Updated
      if (update.Is_Updated !== undefined) {
        sheet.getRange(targetRow, COLS.Is_Updated).setValue(update.Is_Updated);
      }
      
      updatedCount++;
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        updatedCount: updatedCount,
        message: updatedCount + ' records updated' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
