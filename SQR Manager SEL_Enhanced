// Modified and v201502 compatible version of http://searchengineland.com/adwords-scripts-every-level-part-4-search-query-manager-free-script-included-212341
// Use copy of https://docs.google.com/a/gryffin.com/spreadsheets/d/1N99Vyzn61mQqIwnFQ7CucplSSAA0HnEM3zzxlOcyY2Q/edit#gid=160145074

var SQR_MANAGER_URL = '$$Enter Spreadsheet URL here$$';  // Swap $$Enter Spreadsheet URL here$$ with actual Spreadsheet-URL

var spreadsheetAccess = new SpreadsheetAccess(SQR_MANAGER_URL, 'Export Rules');
var totalColumns;
var REPORT_SPREADSHEET_URL;

function main() {
  
  var accName = AdWordsApp.currentAccount().getName();
  var inputSheet = SpreadsheetApp.openByUrl(SQR_MANAGER_URL).getSheetByName('Script Settings');
  var rowNum = getAccountRowNum(inputSheet,accName,AdWordsApp.currentAccount().getCustomerId());
  if(rowNum == 0) {
    throw 'Account Name and Id not found in SQR Manager Script Settings Sheet';
  }
  
  REPORT_SPREADSHEET_URL = inputSheet.getRange(rowNum,4,1,1).getValue();
  var actionFlag = inputSheet.getRange(rowNum,3,1,1).getValue(); 
  
  log('Report Url: '+REPORT_SPREADSHEET_URL);    
  
  var now = new Date(Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), 'MMM dd, yyyy HH:mm:ss'));
  var today = Utilities.formatDate(new Date(), AdWordsApp.currentAccount().getTimeZone(), 'MMM dd, yyyy HH:mm');
  
  if(actionFlag.toLowerCase() == 'make changes') {
    makeChanges();
  } else if(actionFlag.toLowerCase() == 'export') {
    if(!REPORT_SPREADSHEET_URL) {
      var templateSpreadsheet = SpreadsheetApp.openByUrl('https://docs.google.com/a/gryffin.com/spreadsheets/d/11S1EjOV_oP5gnBpfNLoiwIM1kMN1FNqQW6G9O06uSbQ/edit');
      var ss = templateSpreadsheet.copy(accName + ' - Query Manager (' + today + ')');
      REPORT_SPREADSHEET_URL = ss.getUrl();
      inputSheet.getRange(rowNum,4,1,1).setValue(REPORT_SPREADSHEET_URL);
      log('New Report Url: '+REPORT_SPREADSHEET_URL);
    } else {
      SpreadsheetApp.openByUrl(REPORT_SPREADSHEET_URL).setName(accName + ' - Query Manager (' + today + ')');
    }
    exportData();
  } else {
    throw 'Inappropriate Action Flag';
  }
}

function exportData() {
  
  log('Exporting Data for Rules');
  var accId = AdWordsApp.currentAccount().getCustomerId();
  var columns = spreadsheetAccess.sheet.getRange(5, 2, 5, 100).getValues()[0];
  for (var i = 0; i < columns.length; i++) {
    if (columns[i].length == 0 || columns[i] == 'Results') {
      totalColumns = i;
      break;
    }
  }
  
  if (columns[totalColumns] != 'Results') {
    spreadsheetAccess.sheet.getRange(5, totalColumns + 2, 1, 1).
    setValue('Results');
  }
  // clear the results column
  spreadsheetAccess.sheet.getRange(6, totalColumns + 2, 1000, 1).clear();
  
  //var labels = readExistingLabels();
  
  var row = spreadsheetAccess.nextRow();
  var now = new Date(Utilities.formatDate(new Date(), 
                                          AdWordsApp.currentAccount().getTimeZone(), "MMM dd,yyyy HH:mm:ss"));
  
  var reportSheet = SpreadsheetApp.openByUrl(REPORT_SPREADSHEET_URL).getSheets()[0];
  var numRows = reportSheet.getLastRow() - 2;
  
  if(numRows > 0) {
    reportSheet.getRange(3,1,numRows,reportSheet.getLastColumn()).clear();
  }
  
  //var DATE_RANGE = getAdWordsFormattedDate(LAST_N_DAYS, 'yyyyMMdd') + ',' + getAdWordsFormattedDate(1, 'yyyyMMdd');
  
  /**var headerRow = ['Rule', 'Campaign', 'AdGroup', 'KeywordTextMatchingQuery','Query', 'Match Type', 
  'Impressions','Clicks','Cost','Ctr','Average Cpc',
  'ConvertedClicks','CostPerConvertedClick','ClickConversionRate','Average Position'];**/
  
  var reportData = [];  
  while (row != null) {
    if(row[2] != accId || !row[4]) { row = spreadsheetAccess.nextRow(); continue; }
    if(row[3].toLowerCase() != 'yes') { row = spreadsheetAccess.nextRow(); continue; }
    var conditions = [];
    
    for (var i = 5; i < totalColumns; i ++) {
      var header = columns[i-1];
      var value = row[i];
      if (!isNaN(parseFloat(value)) || value.length > 0) {
        if (header.indexOf("'") > 0) {
          value = value.replace(/\'/g,"\\'");
        } else if (header.indexOf("\"") > 0) {
          value = value.replace(/"/g,"\\\"");
        }
        
        conditions.push(header.replace('?', value));
      }
    }
    
    var DATE_RANGE = row[4];
    var dateTo = getAdWordsFormattedDate(1, 'yyyyMMdd');
    if(DATE_RANGE == 'LAST_90_DAYS') {
      DATE_RANGE = getAdWordsFormattedDate(90, 'yyyyMMdd') + ',' + dateTo;
    } else if(DATE_RANGE == 'LAST_60_DAYS') {
      DATE_RANGE = getAdWordsFormattedDate(60, 'yyyyMMdd') + ',' + dateTo;
    }
    
    var OPTIONS = { includeZeroImpressions : false };
    var cols = ['CampaignName','AdGroupName', 'KeywordTextMatchingQuery','Query', 'MatchType','Impressions','Clicks',
                'Cost','Ctr','AverageCpc','ConvertedClicks','CostPerConvertedClick',
                'ClickConversionRate','AveragePosition'];
    
    var report = 'SEARCH_QUERY_PERFORMANCE_REPORT';
    
    var query = ['select',cols.join(','),'from',report,
                 'where Impressions > 0',
                 conditions.length > 0 ? 'and ' + conditions.join(' and ') : '',
                 'during',DATE_RANGE].join(' ');
    var reportIter = AdWordsApp.report(query, OPTIONS).rows();
    
    while(reportIter.hasNext()) {
      var reportRow = reportIter.next();
      var row_array = [row[0]];
      for(var k in cols) {
        row_array.push(reportRow[cols[k]]);
      }
      reportData.push(row_array);
    }	  
    
    row = spreadsheetAccess.nextRow();
  }
  
  
  reportSheet.setFrozenRows(2);      
  reportSheet.setFrozenColumns(4);   
  if(reportData.length > 0) {	
    reportSheet.getRange(3,1,reportData.length,reportData[0].length).setValues(reportData);
    reportSheet.getDataRange().setFontFamily('Trebuchet MS').setFontSize(10);
    
    var numRows = reportSheet.getLastRow();
    reportSheet.getRange(3, 7, numRows, 1).setNumberFormat("#,##0"); //Impressions
    reportSheet.getRange(3, 8, numRows, 1).setNumberFormat("#,##0"); // Clicks
    reportSheet.getRange(3, 9, numRows, 1).setNumberFormat("€#,##0.00"); //Cost
    reportSheet.getRange(3, 10, numRows, 1).setNumberFormat("0.00%"); //Ctr
    reportSheet.getRange(3, 11, numRows, 1).setNumberFormat("€#,##0.00"); //Cost
    reportSheet.getRange(3, 12, numRows, 1).setNumberFormat("#,##0"); //Conversions
    reportSheet.getRange(3, 13, numRows, 1).setNumberFormat("€#,##0.00"); //CPA
    reportSheet.getRange(3, 14, numRows, 1).setNumberFormat("0.00%"); //CR
    reportSheet.getRange(3, 15, numRows, 1).setNumberFormat("#,##0.0"); //Avg Pos             
    
    /**var newCols = ['Campaign Name To be added as Negative','Keyword to Add as Campaign Negative',
    'Campaign Name to add as Ad Group Negative','AdGroup Name add as Ad Group Negative','Keyword to Add to AdGroup as Negative',
    'Campaign Name to add New Keyword','AdGroup Name to Add new Keyword','Keyword to Add To AdGroup'];
    reportSheet.getRange(1,reportSheet.getLastColumn()+1,1,newCols.length).setValues([newCols]).setBackground('#a2c4c9').setFontWeight('bold');
    
    reportSheet.getRange(1,1,1,reportSheet.getLastColumn()).setVerticalAlignment("middle").setBackground('#b6d7a8').setFontWeight('bold');
    **/  
    if((reportSheet.getMaxColumns() - reportSheet.getLastColumn()) > 0) {
      reportSheet.deleteColumns(reportSheet.getLastColumn()+1, reportSheet.getMaxColumns() - reportSheet.getLastColumn());
    } 
  }
  
  var folderPath = 'AdWords Script Spreadsheets/'+AdWordsApp.currentAccount().getName()+'/Search Query Reports';
  addToFolder(folderPath, ' - Query Manager');
  
  var now = new Date(Utilities.formatDate(new Date(),
                                          AdWordsApp.currentAccount().getTimeZone(), 'MMM dd,yyyy HH:mm:ss'));
  spreadsheetAccess.spreadsheet.getRangeByName('last_execution').setValue(now);
}

function logError(error) {
  spreadsheetAccess.sheet.getRange(spreadsheetAccess.currentRow(),
                                   totalColumns + 2, 1, 1)
  .setValue(error)
  .setFontColor('#c00')
  .setFontSize(8)
  .setFontWeight('bold');
}
function logResult(result) {
  spreadsheetAccess.sheet.getRange(spreadsheetAccess.currentRow(),
                                   totalColumns + 2, 1, 1)
  .setValue(result)
  .setFontColor('#444')
  .setFontSize(8)
  .setFontWeight('normal');
}

function SpreadsheetAccess(spreadsheetUrl, sheetName) {
  this.spreadsheet = SpreadsheetApp.openByUrl(spreadsheetUrl);
  this.sheet = this.spreadsheet.getSheetByName(sheetName);
  this.cells = this.sheet.getRange(6, 1, this.sheet.getMaxRows(),
                                   this.sheet.getMaxColumns()).getValues();
  this.rowIndex = 0;
  
  this.nextRow = function() {
    for (; this.rowIndex < this.cells.length; this.rowIndex++) {
      if (this.cells[this.rowIndex][0]) {
        return this.cells[this.rowIndex++];
      }
    }
    return null;
  };
  this.currentRow = function() {
    return this.rowIndex + 5;
  };
}

function createLabelIfNeeded(name) {
  if(!AdWordsApp.labels().withCondition("Name = '"+name+"'").get().hasNext()) {
    AdWordsApp.createLabel(name);
  }
}  

function addToFolder(folderPath, fileName) {
  
  var folder = createFolderPath(folderPath);
  
  var fileIter = DriveApp.getRootFolder().searchFiles("title contains '" + fileName + "'");
  while(fileIter.hasNext()){
    var file = fileIter.next();
    folder.addFile(file);
    DriveApp.getRootFolder().removeFile(file);
  }     
}

function createFolderPath(folderPath) {
  var errorCount = 3;
  var errors = [];
  while(errorCount > 0) {
    try {
      var pathArray = folderPath.split('/');
      var folder;
      for(var i in pathArray) {
        var parentName = pathArray[i];
        if(!parentName || parentName === '') { continue; }
        if(!folder && !DriveApp.getFoldersByName(parentName).hasNext()) {
          folder = DriveApp.createFolder(parentName);
        } else if(folder && !folder.getFoldersByName(parentName).hasNext()) {
          folder = folder.createFolder(parentName);
        } else {
          folder = (!folder) ? DriveApp.getFoldersByName(parentName).next() 
          : folder.getFoldersByName(parentName).next();
        }
      }
      return folder;
    } catch (e) {
      errorCount--;
      errors.push(e);
      Utilities.sleep(1000);
    }
  }
  throw errors.join('\n');
}

function makeChanges() {
  
  if(!REPORT_SPREADSHEET_URL) { throw 'Spreadsheet Url Missing. You should export data first'; return; }
  log('Populating Changes');
  var sheet = SpreadsheetApp.openByUrl(REPORT_SPREADSHEET_URL).getSheets()[0];
  
  var numRows = sheet.getLastRow() - 2;
  if(numRows < 1) { log('No data to process'); return; }
  
  var numCols = 22; 
  var colNum = sheet.getLastColumn() + 1 - numCols;
  
  var campNegatives = {};
  var agNegatives = {};
  var keywords = {};
  var actionMap = {};
  
  var labelCpcMap = {};
  
  var queries = sheet.getRange(3,colNum-2,numRows,2).getValues();
  var rows = sheet.getRange(3,colNum,numRows,numCols).getValues();
  for(var k in rows) {
    var row = rows[k].filter( function( item, index, inputArray ) { return inputArray.indexOf(item) == index;  });
    if(row.length <= 1 && !row[0]) { continue; }
    
    var adsAdded = false;
    
    if(rows[k][0] && rows[k][1]) {
      if(!campNegatives[rows[k][0]]) { campNegatives[rows[k][0]] = []; }	
      campNegatives[rows[k][0]].push(addMatchtype(queries[k][1].trim(),rows[k][1]));
    }
    
    if(rows[k][2] && rows[k][3] && rows[k][4]) {
      var key = rows[k][2] + '~~' + rows[k][3];
      if(!agNegatives[key]) { agNegatives[key] = []; }
      agNegatives[key].push(addMatchtype(queries[k][1].trim(),rows[k][4]));
      if(rows[k][13] && rows[k][14] && rows[k][10] && rows[k][11] && rows[k][12]) {
        if(!actionMap[key]) { actionMap[key] = new Array(); }
        adsAdded = true;
        actionMap[key].push({ headline: rows[k][10],
                             desc1: rows[k][11],
                             desc2: rows[k][12],
                             displayUrl: rows[k][13],
                             destinationUrl: rows[k][14],
                             mobilePref: rows[k][15] ? true : false
                            });
      }
      
      if(rows[k][16] && rows[k][17] && rows[k][18] && rows[k][19] && rows[k][20]) {
        if(!actionMap[key]) { actionMap[key] = new Array(); }
        adsAdded = true;
        actionMap[key].push({ headline: rows[k][16],
                             desc1: rows[k][17],
                             desc2: rows[k][18],
                             displayUrl: rows[k][19],
                             destinationUrl: rows[k][20],
                             mobilePref: rows[k][21] ? true : false
                            });
      }
    }
    
    if(rows[k][5] && rows[k][6] && rows[k][7]) {
      var key = rows[k][5] + '~~' + rows[k][6];
      if(!keywords[key]) { keywords[key] = []; }
      var kwToAdd = addMatchtype(queries[k][0].trim(),rows[k][7]);
      keywords[key].push(kwToAdd);
      labelCpcMap[key+'~~'+kwToAdd] = [rows[k][8],rows[k][9]];
      
      if(rows[k][13] && rows[k][14] && rows[k][10] && rows[k][11] && rows[k][12] && !adsAdded) {
        if(!actionMap[key]) { actionMap[key] = new Array(); }
        actionMap[key].push({ headline: rows[k][10],
                             desc1: rows[k][11],
                             desc2: rows[k][12],
                             displayUrl: rows[k][13],
                             destinationUrl: rows[k][14],
                             mobilePref: rows[k][15] ? true : false
                            });
      }
      
      if(rows[k][16] && rows[k][17] && rows[k][18] && rows[k][19] && rows[k][20] && !adsAdded) {
        if(!actionMap[key]) { actionMap[key] = new Array(); }
        actionMap[key].push({ headline: rows[k][16],
                             desc1: rows[k][17],
                             desc2: rows[k][18],
                             displayUrl: rows[k][19],
                             destinationUrl: rows[k][20],
                             mobilePref: rows[k][21] ? true : false
                            });
      }        
    }    
  }
  
  var [campMap,agMap] = setupMaps();
  
  for(var key in campNegatives) {
    var camp = campMap[key];
    if(!camp) { continue; }
    var newNegatives = campNegatives[key];
    var exitingNegatives = [];
    var negatives = camp.negativeKeywords().get();
    while(negatives.hasNext()){
      exitingNegatives.push(negatives.next().getText());
    }
    
    var toAdd = newNegatives.filter(function(val) { return exitingNegatives.indexOf(val) == -1; })
    for(var k in toAdd) {
      camp.createNegativeKeyword(toAdd[k]);
    }
  }
  
  for(var key in agNegatives) {
    var newNegatives = agNegatives[key];
    var ag = agMap[key];
    var exitingNegatives = [];
    if(!ag) { 
      var camp = campMap[key.split('~~')[0]];
      if(!camp) { continue; }
      var ag = camp.newAdGroupBuilder().withName(key.split('~~')[1]).create();
      agMap[key] = ag;
      var ads = actionMap[key];
      for(var n in ads) {
        var action = ads[n];
        if(action){
          if(validateAd(action)) {
            ag.newTextAdBuilder()
            .withHeadline(action.headline)
            .withDescription1(action.desc1)
            .withDescription2(action.desc2)
            .withDisplayUrl(action.displayUrl)
            .withDestinationUrl(action.destinationUrl)
            .withMobilePreferred(action.mobilePref)
            .build();
          }
        }
      }
    } else {
      var negatives = ag.negativeKeywords().get();
      while(negatives.hasNext()){
        exitingNegatives.push(negatives.next().getText());
      }
    }
    
    var toAdd = newNegatives.filter(function(val) { return exitingNegatives.indexOf(val) == -1; })
    
    var kws = ag.keywords().get();
    while(kws.hasNext()){
      var kw = kws.next();
      if(toAdd.indexOf(kw.getText()) > -1) {
        kw.remove();
      }
    }
    
    for(var k in toAdd) {
      ag.createNegativeKeyword(toAdd[k]);
    }  
  }
  
  for(var key in keywords) {
    var newKws = keywords[key];
    var ag = agMap[key];
    var exitingKws = [];
    if(!ag) {
      var camp = campMap[key.split('~~')[0]];
      if(!camp) { continue; }
      var ag = camp.newAdGroupBuilder().withName(key.split('~~')[1]).create();
      agMap[key] = ag;
      var ads = actionMap[key];
      for(var n in ads) {
        var action = ads[n];
        if(action){
          if(validateAd(action)) {
            ag.newTextAdBuilder()
            .withHeadline(action.headline)
            .withDescription1(action.desc1)
            .withDescription2(action.desc2)
            .withDisplayUrl(action.displayUrl)
            .withDestinationUrl(action.destinationUrl)
            .withMobilePreferred(action.mobilePref)
            .build();
          }
        }
      }
    } else {
      var kws = ag.keywords().get();
      while(kws.hasNext()){
        exitingKws.push(kws.next().getText());
      }
    }
    
    var toAdd = newKws.filter(function(val) { return exitingKws.indexOf(val) == -1; })
    for(var k in toAdd) {
      var [cpc,label] = labelCpcMap[key+'~~'+toAdd[k]];
      
      var newCpc = cpc ? cpc : ag.getKeywordMaxCpc()
      var keywordOperation = ag.newKeywordBuilder()
      .withText(toAdd[k])
      .withCpc(newCpc)
      .build();
      var newKw = keywordOperation.getResult();
      
      if(label) { 
        createLabelIfNeeded(label);
        newKw.applyLabel(label); 
      }
      
    } 
  }
}

function addMatchtype(text,mt)  {    
  mt = mt.toUpperCase();
  if(mt == 'PHRASE') {
    return '"'+text+'"';
  } 
  if(mt == 'EXACT') {
    return '['+text+']';
  }
  if(mt == 'BMM') {
    return '+'+text.split(' ').join(' +');
  }
  return text;
}

function setupMaps() {
  var agMap = {};
  var campMap = {};    
  var adGroups = AdWordsApp.adGroups().get();
  while(adGroups.hasNext()){
    var ag = adGroups.next();
    agMap[[ag.getCampaign().getName(),ag.getName()].join('~~')] = ag;
  } 
  
  var camps = AdWordsApp.campaigns().get();
  while(camps.hasNext()){
    var camp = camps.next();
    campMap[camp.getName()] = camp;
  }
  
  return [campMap,agMap];
}

function validateAd(action) {
  if(action.headline.length > 25) { return false; }
  if(action.desc1.length > 35) { return false; }
  if(action.desc2.length > 35) { return false; }
  if(action.displayUrl.length > 35) { return false; }
  return true;
} 


/**
* Get AdWords Formatted date for n days back
* @param {int} d - Numer of days to go back for start/end date
* @return {String} - Formatted date yyyyMMdd
**/
function getAdWordsFormattedDate(d, format){
  var date = new Date();
  date.setDate(date.getDate() - d);
  return Utilities.formatDate(date,AdWordsApp.currentAccount().getTimeZone(),format);
}


//This function gets the file from GDrive
function getFile(loc) {
  var locArray = loc.split('/');
  var folder = getFolder(loc);
  if(folder.getFilesByName(locArray[locArray.length-1]).hasNext()) {
    return folder.getFilesByName(locArray[locArray.length-1]).next();
  } else {
    return null;
  }
}

//This function finds the folder for the file and creates folders if needed
function getFolder(folderPath) {
  var folder = DriveApp.getRootFolder();
  if(folderPath) {
    var pathArray = folderPath.split('/');
    for(var i in pathArray) {
      if(i == pathArray.length - 1) { break; }
      var folderName = pathArray[i];
      if(folder.getFoldersByName(folderName).hasNext()) {
        folder = folder.getFoldersByName(folderName).next();
      }
    }
  }
  return folder;
}

/**
* Check scripts schedule against current time
* @param {Object} sheet - Input sheet
* @param {String} accName - Name of the account
* @return {int} rowNum - Row Num for the account
**/
function getAccountRowNum(sheet,accName,accId){	
  
  var lastRow = sheet.getLastRow();
  var found = false;
  var i = 0;	
  
  var name = accName.toLowerCase();
  var customerName = sheet.getRange("A2:A"+lastRow).getValues();
  
  for(i = 0; i < customerName.length; i++) {
    if(customerName[i][0].toLowerCase() == name) {
      found = true;
      break;	
    }	
  }
  
  if(!found) {
    var customerId = sheet.getRange("B2:B"+lastRow).getValues();
    
    for(i = 0; i < customerId.length; i++) {
      if(customerId[i][0] == accId) {
        found = true;
        break;	
      }	
    }
  }
  
  if(found){
    var row = i + 2;
    Logger.log(row);
    return row;
  } else{
    Logger.log("The Account was not found in the spreadsheet!");
    return 0;
  }
}


function log(msg) {
  var time = Utilities.formatDate(new Date(),AdWordsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd HH:mm:ss.SSS');
  Logger.log(time + ' - ' + msg);
}
